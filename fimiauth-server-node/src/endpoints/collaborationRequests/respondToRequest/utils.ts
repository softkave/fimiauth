import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {SemanticProviderMutationParams} from '../../../contexts/semantic/types.js';
import {
  CollaborationRequest,
  kCollaborationRequestStatusTypeMap,
} from '../../../definitions/collaborationRequest.js';
import {
  EmailJobParams,
  kEmailJobType,
  kJobType,
} from '../../../definitions/job.js';
import {SessionAgent} from '../../../definitions/system.js';
import {kSystemSessionAgent} from '../../../utils/agent.js';
import {formatDate, getTimestamp} from '../../../utils/dateFns.js';
import {ServerStateConflictError} from '../../../utils/errors.js';
import {INTERNAL_createAgentToken} from '../../agentTokens/addToken/utils.js';
import {addAssignedPermissionGroupList} from '../../assignedItems/addAssignedItems.js';
import {queueJobs} from '../../jobs/queueJobs.js';
import {assertWorkspace} from '../../workspaces/utils.js';
import {assertCollaborationRequest} from '../utils.js';
import {RespondToCollaborationRequestEndpointParams} from './types.js';

async function addFimiauthUserToWorkspace(params: {
  agent: SessionAgent;
  workspaceId: string;
  userId: string;
  opts: SemanticProviderMutationParams;
  request: CollaborationRequest;
}) {
  const {agent, workspaceId, userId, opts, request} = params;
  const agentToken = await INTERNAL_createAgentToken(
    agent,
    workspaceId,
    {name: `Agent token for ${userId}`, providedResourceId: userId},
    opts
  );

  if (request.permissionGroupIds.length > 0) {
    await addAssignedPermissionGroupList(
      agent,
      workspaceId,
      request.permissionGroupIds,
      agentToken.resourceId,
      /** deleteExisting */ false,
      /** skipPermissionGroupsExistCheck */ true,
      /** skip auth check */ true,
      opts
    );
  }
}

export const INTERNAL_respondToCollaborationRequest = async (params: {
  agent: SessionAgent;
  data: RespondToCollaborationRequestEndpointParams;
  opts: SemanticProviderMutationParams;
}) => {
  const {agent, data, opts} = params;
  const request = await kSemanticModels
    .collaborationRequest()
    .getOneById(data.requestId, opts);
  assertCollaborationRequest(request);

  const isExpired =
    request.expiresAt && new Date(request.expiresAt).valueOf() < Date.now();
  const isAccepted =
    data.response === kCollaborationRequestStatusTypeMap.Accepted;

  if (isExpired) {
    throw new ServerStateConflictError(
      `Collaboration request expired on ${formatDate(request.expiresAt!)}`
    );
  }

  const [updatedRequest] = await Promise.all([
    kSemanticModels
      .collaborationRequest()
      .getAndUpdateOneById(
        data.requestId,
        {statusDate: getTimestamp(), status: data.response},
        opts
      ),
    isAccepted &&
      data.userId &&
      addFimiauthUserToWorkspace({
        agent,
        workspaceId: request.workspaceId,
        userId: data.userId,
        opts,
        request,
      }),
  ]);

  assertCollaborationRequest(updatedRequest);
  return updatedRequest;
};

export async function notifySenderOnCollaborationRequestResponse(
  request: CollaborationRequest
) {
  const workspace = await kSemanticModels
    .workspace()
    .getOneById(request.workspaceId);
  assertWorkspace(workspace);
  const sender = request.senderEmail;

  if (sender) {
    kUtilsInjectables.promises().callAndForget(() =>
      queueJobs<EmailJobParams>(workspace.resourceId, undefined, {
        createdBy: kSystemSessionAgent,
        type: kJobType.email,
        idempotencyToken: Date.now().toString(),
        params: {
          type: kEmailJobType.collaborationRequestResponse,
          emailAddress: [sender],
          userId: [],
          params: {requestId: request.resourceId},
        },
      })
    );
  }
}

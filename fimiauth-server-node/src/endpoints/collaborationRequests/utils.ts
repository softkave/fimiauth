import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {
  CollaborationRequest,
  PublicCollaborationRequestForUser,
  PublicCollaborationRequestForWorkspace,
} from '../../definitions/collaborationRequest.js';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {SessionAgent} from '../../definitions/system.js';
import {appAssert} from '../../utils/assertion.js';
import {getFields, makeExtract, makeListExtract} from '../../utils/extract.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {NotFoundError} from '../errors.js';
import {resourceFields, workspaceResourceFields} from '../extractors.js';
import {checkWorkspaceExists} from '../workspaces/utils.js';

const userCollaborationRequestForUserFields =
  getFields<PublicCollaborationRequestForUser>({
    ...resourceFields,
    recipientEmail: true,
    message: true,
    createdAt: true,
    expiresAt: true,
    workspaceName: true,
    readAt: true,
    status: true,
    statusDate: true,
  });

const userCollaborationRequestForWorkspaceFields =
  getFields<PublicCollaborationRequestForWorkspace>({
    ...workspaceResourceFields,
    recipientEmail: true,
    message: true,
    expiresAt: true,
    workspaceId: true,
    workspaceName: true,
    readAt: true,
    status: true,
    statusDate: true,
    permissionGroupIds: true,
    senderEmail: true,
  });

export async function checkCollaborationRequestAuthorization(
  agent: SessionAgent,
  request: CollaborationRequest,
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  const workspace = await checkWorkspaceExists(request.workspaceId);
  await checkAuthorizationWithAgent({
    agent,
    opts,
    workspaceId: workspace.resourceId,
    spaceId: workspace.spaceId,
    target: {action, targetId: request.resourceId},
  });

  return {agent, request, workspace};
}

export async function checkCollaborationRequestAuthorization02(
  agent: SessionAgent,
  requestId: string,
  action: FimidaraPermissionAction,
  opts?: SemanticProviderOpParams
) {
  const request = await kSemanticModels
    .collaborationRequest()
    .getOneById(requestId, opts);

  assertCollaborationRequest(request);
  return checkCollaborationRequestAuthorization(agent, request, action);
}

export const collaborationRequestForUserExtractor = makeExtract(
  userCollaborationRequestForUserFields
);
export const collaborationRequestForUserListExtractor = makeListExtract(
  userCollaborationRequestForUserFields
);
export const collaborationRequestForWorkspaceExtractor = makeExtract(
  userCollaborationRequestForWorkspaceFields
);
export const collaborationRequestForWorkspaceListExtractor = makeListExtract(
  userCollaborationRequestForWorkspaceFields
);

export function throwCollaborationRequestNotFound() {
  throw new NotFoundError('Collaboration request not found');
}

export function assertCollaborationRequest(
  request?: CollaborationRequest | null
): asserts request {
  appAssert(request, kReuseableErrors.collaborationRequest.notFound());
}

import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {SemanticCollaborationRequestProviderFilter} from '../../../contexts/semantic/collaborationRequest/types.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {SessionAgent} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getSpaceResourceListQuery00} from '../../utils.js';

export async function getWorkspaceCollaborationRequestsQuery(
  agent: SessionAgent,
  workspace: Workspace,
  spaceId: string,
  email?: string
) {
  const permissionsSummaryReport = await checkAuthorizationWithAgent({
    agent,
    workspaceId: workspace.resourceId,
    spaceId,
    target: {
      targetId: workspace.resourceId,
      action: kFimidaraPermissionActions.readCollaborationRequest,
    },
  });

  const q: SemanticCollaborationRequestProviderFilter =
    getSpaceResourceListQuery00(spaceId, permissionsSummaryReport);

  if (email) {
    q.email = email;
  }

  return q;
}

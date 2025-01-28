import {resolveTargetChildrenAccessCheckWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {SessionAgent} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getSpaceResourceListQuery00} from '../../utils.js';

export async function getWorkspaceAgentTokensQuery(
  agent: SessionAgent,
  workspace: Workspace,
  spaceId: string
) {
  const report = await resolveTargetChildrenAccessCheckWithAgent({
    agent,
    workspace,
    spaceId,
    workspaceId: workspace.resourceId,
    target: {
      action: kFimidaraPermissionActions.readAgentToken,
      targetId: workspace.resourceId,
    },
  });

  return getSpaceResourceListQuery00(workspace, report);
}

import {resolveTargetChildrenAccessCheckWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {SessionAgent} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getSpaceResourceListQuery00} from '../../utils.js';

export async function getWorkspacePermissionGroupsQuery(
  agent: SessionAgent,
  workspace: Workspace,
  spaceId: string
) {
  const report = await resolveTargetChildrenAccessCheckWithAgent({
    agent,
    workspace,
    workspaceId: workspace.resourceId,
    spaceId,
    target: {
      action: kFimidaraPermissionActions.readPermission,
      targetId: workspace.resourceId,
    },
  });

  return getSpaceResourceListQuery00(spaceId, report);
}

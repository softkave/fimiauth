import {resolveTargetChildrenAccessCheckWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {SessionAgent} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getWorkspaceResourceListQuery00} from '../../utils.js';

export async function getWorkspaceCollaboratorsQuery(
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
      action: kFimidaraPermissionActions.readCollaborator,
      targetId: workspace.resourceId,
    },
  });

  return getWorkspaceResourceListQuery00(workspace, report);
}

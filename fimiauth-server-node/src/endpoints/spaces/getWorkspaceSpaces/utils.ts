import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {SessionAgent} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getSpaceResourceListQuery00} from '../../utils.js';

export async function getWorkspaceSpacesQuery(
  agent: SessionAgent,
  workspace: Workspace
) {
  const report = await checkAuthorizationWithAgent({
    agent,
    workspaceId: workspace.resourceId,
    target: {action: 'getSpace', targetId: workspace.resourceId},
    spaceId: workspace.resourceId,
  });

  return getSpaceResourceListQuery00(workspace.resourceId, report);
}

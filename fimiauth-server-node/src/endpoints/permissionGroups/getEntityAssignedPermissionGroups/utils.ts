import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../../contexts/semantic/types.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {SessionAgent} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';

export async function checkReadEntityAssignedPermissionGroups(params: {
  agent: SessionAgent;
  workspace: Workspace;
  spaceId: string;
  entityId: string;
  opts?: SemanticProviderOpParams;
}) {
  const {agent, workspace, spaceId, entityId, opts} = params;
  if (isFetchingOwnPermissionGroups(agent, entityId)) {
    return true;
  } else {
    await checkAuthorizationWithAgent({
      agent,
      opts,
      workspaceId: workspace.resourceId,
      spaceId,
      target: {
        targetId: entityId,
        action: kFimidaraPermissionActions.updatePermission,
      },
    });

    return true;
  }
}

export function isFetchingOwnPermissionGroups(
  agent: SessionAgent,
  entityId: string
) {
  return agent.agentId === entityId;
}

export async function fetchEntityAssignedPermissionGroupList(params: {
  spaceId: string;
  entityId: string;
  includeInheritedPermissionGroups?: boolean;
  opts?: SemanticProviderOpParams;
}) {
  const {
    spaceId,
    entityId,
    includeInheritedPermissionGroups = true,
    opts,
  } = params;
  return await kSemanticModels.permissions().getEntityAssignedPermissionGroups(
    {
      spaceId,
      entityId,
      fetchDeep: includeInheritedPermissionGroups,
    },
    opts
  );
}

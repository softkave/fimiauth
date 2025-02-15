import {first, forEach, isString} from 'lodash-es';
import {
  checkAuthorizationWithAgent,
  getAuthorizationAccessChecker,
  kResolvedAuthCheckAccess,
} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {SemanticProviderOpParams} from '../../../contexts/semantic/types.js';
import {
  FimidaraPermissionAction,
  kFimidaraPermissionActions,
} from '../../../definitions/permissionItem.js';
import {
  Resource,
  ResourceWrapper,
  SessionAgent,
} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {appAssert} from '../../../utils/assertion.js';
import {convertToArray} from '../../../utils/fns.js';
import {indexArray} from '../../../utils/indexArray.js';
import {InvalidRequestError} from '../../errors.js';
import {getPermissionItemTargets} from '../getPermissionItemTargets.js';
import {PermissionItemInputTarget} from '../types.js';
import {getPermissionItemEntities} from '../utils.js';
import {
  ResolveEntityPermissionItemInput,
  ResolveEntityPermissionsEndpointParams,
  ResolvedEntityPermissionItem,
  ResolvedEntityPermissionItemTarget,
} from './types.js';

type ResolvedTargetItem = ResourceWrapper & ResolvedEntityPermissionItemTarget;
type ResolvedTargetsMap = Record<string, ResolvedTargetItem>;
type FlattenedPermissionRequestItem = {
  entity: ResourceWrapper;
  action: FimidaraPermissionAction;
  target: ResourceWrapper;
  resolvedTarget: ResolvedEntityPermissionItemTarget;
};

/** Fetch artifacts and ensure they belong to workspace. */
async function getArtifacts(
  agent: SessionAgent,
  workspace: Workspace,
  data: ResolveEntityPermissionsEndpointParams
) {
  let inputEntities: string[] = [];
  let inputTargets: PermissionItemInputTarget[] = [];

  data.items.forEach(item => {
    if (item.entityId) {
      inputEntities = inputEntities.concat(convertToArray(item.entityId));
    }

    inputTargets = inputTargets.concat(convertToArray(item));
  });

  appAssert(
    inputEntities.length,
    new InvalidRequestError('No permission entity provided')
  );

  const [entities, targets] = await Promise.all([
    getPermissionItemEntities({
      agent,
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.resourceId,
      entityIds: inputEntities,
    }),
    getPermissionItemTargets({
      agent,
      workspace,
      spaceId: data.spaceId ?? workspace.resourceId,
      target: inputTargets,
      action: kFimidaraPermissionActions.readPermission,
    }),
  ]);

  return {entities, targets};
}

/** Index artifacts for quick retrieval. */
function indexArtifacts(entities: ResourceWrapper<Resource>[]) {
  const entitiesMapById = indexArray(entities, {path: 'resourceId'});
  const getEntities = (inputEntity: string | string[]) => {
    const eMap: Record<string, ResourceWrapper> = {};

    // TODO: should we throw error when some entities are not found?
    convertToArray(inputEntity).forEach(entityId => {
      if (entitiesMapById[entityId]) eMap[entityId] = entitiesMapById[entityId];
    });

    return eMap;
  };

  return {getEntities};
}

export const INTERNAL_resolveEntityPermissions = async (
  agent: SessionAgent,
  workspace: Workspace,
  data: ResolveEntityPermissionsEndpointParams
) => {
  const {entities, targets} = await getArtifacts(agent, workspace, data);
  const {getEntities} = indexArtifacts(entities);

  // Requested permissions flattened to individual items, for example, list of
  // entity IDs, target IDs, target type, appliesTo, etc. flattened into
  // singular items. There's also a bit of mix-matching, matching the different
  // items to each other like target ID matched to each item in provided target
  // type, etc.
  const itemsToResolve: FlattenedPermissionRequestItem[] = [];

  function fResolvedTargetItems(
    entity: ResourceWrapper<Resource>,
    action: FimidaraPermissionAction,
    tMap: ResolvedTargetsMap
  ) {
    forEach(tMap, tFromMap => {
      itemsToResolve.push({
        entity,
        action,
        target: tFromMap,
        resolvedTarget: tFromMap,
      });
    });
  }

  function fTarget(
    entity: ResourceWrapper<Resource>,
    action: FimidaraPermissionAction,
    item: ResolveEntityPermissionItemInput
  ) {
    const {targets: tMap} = targets.getByTarget(item);
    fResolvedTargetItems(entity, action, tMap);
  }

  function fActions(
    entity: ResourceWrapper<Resource>,
    item: ResolveEntityPermissionItemInput
  ) {
    convertToArray(item.action).forEach(action => {
      fTarget(entity, action, item);
    });
  }

  function fEntities(item: ResolveEntityPermissionItemInput) {
    const itemEntitiesMap = getEntities(item.entityId);

    forEach(itemEntitiesMap, entity => {
      fActions(entity, item);
    });
  }

  data.items.forEach(fEntities);

  // TODO: Better access check function
  const checkers = await Promise.all(
    itemsToResolve.map(nextItem =>
      getAuthorizationAccessChecker({
        workspaceId: workspace.resourceId,
        spaceId: data.spaceId ?? workspace.resourceId,
        target: {
          targetId: workspace.resourceId,
          action: nextItem.action,
          entityId: nextItem.entity.resourceId,
        },
      })
    )
  );

  const result: ResolvedEntityPermissionItem[] = itemsToResolve.map(
    (nextItem, index): ResolvedEntityPermissionItem => {
      const checker = checkers[index];
      const checkResult = checker.checkForTargetId({
        entityId: nextItem.entity.resourceId,
        targetId: nextItem.target.resourceId,
        action: nextItem.action,
        nothrow: true,
      });

      return {
        access: checkResult.access === kResolvedAuthCheckAccess.full,
        action: nextItem.action,
        entityId: nextItem.entity.resourceId,
        target: nextItem.resolvedTarget,
        permittingEntityId: nextItem.entity.resourceId,
        permittingTargetId: nextItem.target.resourceId,
      };
    }
  );

  return result;
};

export async function checkResolveEntityPermissionsAuth(
  agent: SessionAgent,
  workspace: Workspace,
  data: ResolveEntityPermissionsEndpointParams,
  opts?: SemanticProviderOpParams
) {
  // Check is agent is resolving own permissions. If so, we don'target need to do
  // auth check.
  const isResolvingOwnPermissions = isAgentResolvingOwnPermissions(agent, data);

  if (!isResolvingOwnPermissions) {
    await checkAuthorizationWithAgent({
      agent,
      opts,
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.resourceId,
      target: {targetId: workspace.resourceId, action: 'updatePermission'},
    });
  }
}

function isAgentResolvingOwnPermissions(
  agent: SessionAgent,
  data: ResolveEntityPermissionsEndpointParams
) {
  let hasEntity = false;

  for (const nextItem of data.items) {
    if (nextItem.entityId) {
      hasEntity = true;
      const isSame = isAgentSameAsEntity(agent, nextItem.entityId);

      if (!isSame) return false;
    }
  }

  if (hasEntity) return true;
  else return false;
}

function isAgentSameAsEntity(agent: SessionAgent, entity: string | string[]) {
  if (isString(entity)) return agent.agentId === entity;
  return entity.length === 1 && first(entity) === agent.agentId;
}

import {format} from 'util';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {
  SessionAgent,
  WorkspaceResource,
  getWorkspaceResourceTypeList,
  kFimidaraResourceType,
  kPermissionContainerTypes,
  kPermissionEntityTypes,
} from '../../definitions/system.js';
import {getResourceTypeFromId} from '../../utils/resource.js';
import {InvalidRequestError} from '../errors.js';
import {checkResourcesBelongToSpace} from '../resources/containerCheckFns.js';
import {INTERNAL_getResources} from '../resources/getResources.js';

export async function checkPermissionEntitiesExist(params: {
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  entities: Array<string>;
  action: FimidaraPermissionAction;
}) {
  const {agent, workspaceId, spaceId, entities, action} = params;
  if (entities.length === 0) {
    return;
  }

  entities.forEach(id => {
    const itemType = getResourceTypeFromId(id);
    if (!kPermissionEntityTypes.includes(itemType)) {
      const message = format('Invalid permission entity type %s', itemType);
      throw new InvalidRequestError(message);
    }
  });

  // Intentionally not using transaction read for performance.
  return await INTERNAL_getResources({
    agent,
    workspaceId,
    spaceId,
    allowedTypes: kPermissionEntityTypes,
    inputResources: entities.map(id => ({action, resourceId: id})),
    checkAuth: true,
    checkBelongsToSpace: true,
  });
}

export async function checkPermissionContainersExist(params: {
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  items: Array<string>;
  action: FimidaraPermissionAction;
}) {
  const {agent, workspaceId, spaceId, items, action} = params;

  items.forEach(id => {
    const containerType = getResourceTypeFromId(id);

    if (!kPermissionContainerTypes.includes(containerType)) {
      const message = format(
        'Invalid permission container type %s',
        containerType
      );

      throw new InvalidRequestError(message);
    }
  });

  // Intentionally not using transaction read for performance.
  const resources = await INTERNAL_getResources({
    agent,
    workspaceId,
    spaceId,
    allowedTypes: kPermissionContainerTypes,
    inputResources: items.map(id => {
      const containerType = getResourceTypeFromId(id);
      return {action, resourceId: id, resourceType: containerType};
    }),
    checkAuth: true,
  });

  checkResourcesBelongToSpace(
    spaceId,
    resources.map(r => r.resource as WorkspaceResource)
  );

  return {resources};
}

const targetTypes = getWorkspaceResourceTypeList().filter(
  type => type !== kFimidaraResourceType.All
);

export async function checkPermissionTargetsExist(params: {
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  items: Array<string>;
  action: FimidaraPermissionAction;
}) {
  const {agent, workspaceId, spaceId, items, action} = params;

  /**
   * TODO:
   * - check that they belong to the containers and unique container, action, resource
   */

  if (items.length === 0) {
    return {resources: []};
  }

  // Intentionally not using transaction read for performance.
  const resources = await INTERNAL_getResources({
    agent,
    workspaceId,
    spaceId,
    allowedTypes: targetTypes,
    inputResources: items.map(id => ({action, resourceId: id})),
    checkAuth: true,
  });

  checkResourcesBelongToSpace(
    spaceId,
    resources.map(r => r.resource as WorkspaceResource)
  );

  return {resources};
}

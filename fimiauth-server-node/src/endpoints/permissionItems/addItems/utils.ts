import {get, has, set, uniq} from 'lodash-es';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {SemanticProviderMutationParams} from '../../../contexts/semantic/types.js';
import {
  PermissionItem,
  kFimidaraPermissionActions,
} from '../../../definitions/permissionItem.js';
import {
  SessionAgent,
  kFimidaraResourceType,
} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {newWorkspaceResource} from '../../../utils/resource.js';
import {AddPermissionItemsEndpointParams} from './types.js';

export const INTERNAL_addPermissionItems = async (
  agent: SessionAgent,
  workspace: Workspace,
  data: AddPermissionItemsEndpointParams,
  opts: SemanticProviderMutationParams
) => {
  const entityIds = uniq(data.items.map(item => item.entityId));
  const inputItems: PermissionItem[] = data.items.map(item => {
    return newWorkspaceResource({
      agent,
      type: kFimidaraResourceType.PermissionItem,
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.resourceId,
      seed: {
        targetType: item.targetType ?? '',
        containerId: item.containerId ?? data.spaceId ?? workspace.resourceId,
        targetId: item.targetId,
        action: item.action,
        entityId: item.entityId,
        entityType: item.entityType,
        access: item.access,
      },
    });
  });

  // intentionally not using transaction read because heavy computation may
  // happen when filtering out existing permission items, and we don't want to
  // keep other permission insertion operations waiting.
  // TODO: move to a different thread
  const existingPermissionItems = await kSemanticModels
    .permissions()
    .getPermissionItems({
      entityId: entityIds,
      spaceId: data.spaceId ?? workspace.resourceId,
      sortByDate: true,
    });

  const map: {} = {};
  existingPermissionItems.forEach(item => {
    const key = [
      item.entityId,
      item.targetId,
      item.action,
      String(item.access),
    ];

    if (!has(map, key)) {
      set(map, key, item);
    }
  });

  const newPermissions = inputItems.filter(item => {
    const key = [
      item.entityId,
      item.targetId,
      item.action,
      String(item.access),
    ];
    const wildcardKey = [
      item.entityId,
      item.targetId,
      kFimidaraPermissionActions.wildcard,
      String(item.access),
    ];
    const existingItem = get(map, key);
    const wildcardItem = get(map, wildcardKey);
    const isNew = !existingItem && !wildcardItem;

    if (isNew) {
      set(map, key, item);
    }

    return isNew;
  });

  await kSemanticModels.permissionItem().insertItem(newPermissions, opts);
  return inputItems;
};

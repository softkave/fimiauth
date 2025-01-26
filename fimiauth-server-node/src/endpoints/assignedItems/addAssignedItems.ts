import {isArray} from 'lodash-es';
import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderQueryListParams,
} from '../../contexts/semantic/types.js';
import {AssignedItem} from '../../definitions/assignedItem.js';
import {SessionAgent, kFimidaraResourceType} from '../../definitions/system.js';
import {makeKey} from '../../utils/fns.js';
import {indexArray} from '../../utils/indexArray.js';
import {
  getNewIdForResource,
  getResourceTypeFromId,
  newWorkspaceResource,
} from '../../utils/resource.js';
import {checkPermissionGroupsExist} from '../permissionGroups/utils.js';
import {withAssignedAgent} from '../utils.js';
import {deleteResourceAssignedItems} from './deleteAssignedItems.js';

/**
 * @param context
 * @param workspaceId
 * @param items
 * @param comparatorFn - Return `true` to delete existing item and include new
 * item, and `false` to not include item.
 */
async function filterExistingItems<T extends AssignedItem>(
  workspaceId: string,
  items: T[],
  comparatorFn?: (item01: T, item02: AssignedItem) => boolean,
  opts?: SemanticProviderQueryListParams<T>
) {
  const assigneeIdList: string[] = [];
  const assignedItemIdList: string[] = [];
  items.forEach(item => {
    assigneeIdList.push(item.assigneeId);
    assignedItemIdList.push(item.assignedItemId);
  });
  const existingItems = await kSemanticModels
    .assignedItem()
    .getByWorkspaceAssignedAndAssigneeIds(
      workspaceId,
      assignedItemIdList,
      assigneeIdList,
      opts
    );
  const indexer = (item: Pick<AssignedItem, 'assignedItemId' | 'assigneeId'>) =>
    makeKey([item.assignedItemId, item.assigneeId]);
  const existingItemsMap = indexArray(existingItems, {indexer});
  const itemIdListToDelete: string[] = [];
  const resolvedItems: T[] = [];

  items.forEach(item => {
    const existingItem = existingItemsMap[indexer(item)];
    if (existingItem) {
      if (comparatorFn && comparatorFn(item, existingItem)) {
        itemIdListToDelete.push(existingItem.resourceId);
        resolvedItems.push(item);
      }
    } else {
      resolvedItems.push(item);
    }
  });

  return {itemIdListToDelete, resolvedItems};
}

export async function addAssignedItems<T extends AssignedItem>(
  workspaceId: string,
  items: T[],
  /** No need to delete existing items */ deletedExistingItems: boolean,
  comparatorFn: ((item01: T, item02: AssignedItem) => boolean) | undefined,
  opts: SemanticProviderMutationParams
) {
  if (deletedExistingItems) {
    await kSemanticModels.assignedItem().insertItem(items, opts);
    return items;
  } else {
    const {itemIdListToDelete, resolvedItems} = await filterExistingItems(
      workspaceId,
      items,
      comparatorFn,
      opts
    );
    await Promise.all([
      kSemanticModels.assignedItem().insertItem(resolvedItems, opts),
      itemIdListToDelete &&
        kSemanticModels
          .assignedItem()
          .deleteManyByIdList(itemIdListToDelete, opts),
    ]);
    return resolvedItems;
  }
}

export async function addAssignedPermissionGroupList(
  agent: SessionAgent,
  workspaceId: string,
  permissionGroupsInput: string[],
  assigneeId: string | string[],
  deleteExisting: boolean,
  skipPermissionGroupsExistCheck = false,
  skipAuthCheck = false,
  opts: SemanticProviderMutationParams
) {
  if (deleteExisting) {
    await deleteResourceAssignedItems(
      workspaceId,
      assigneeId,
      [kFimidaraResourceType.PermissionGroup],
      opts
    );
  }

  if (!skipPermissionGroupsExistCheck) {
    await checkPermissionGroupsExist(workspaceId, permissionGroupsInput, opts);
  }

  if (!skipAuthCheck) {
    await checkAuthorizationWithAgent({
      agent,
      opts,
      workspaceId: workspaceId,
      target: {targetId: workspaceId, action: 'updatePermission'},
    });
  }

  const idList = isArray(assigneeId) ? assigneeId : [assigneeId];
  const items: Array<AssignedItem> = [];

  for (const input of permissionGroupsInput) {
    for (const id of idList) {
      const item = withAssignedAgent(
        agent,
        newWorkspaceResource<AssignedItem>(
          agent,
          kFimidaraResourceType.AssignedItem,
          workspaceId,
          {
            meta: {},
            assigneeId: id,
            assigneeType: getResourceTypeFromId(id),
            resourceId: getNewIdForResource(kFimidaraResourceType.AssignedItem),
            assignedItemId: input,
            assignedItemType: kFimidaraResourceType.PermissionGroup,
          }
        )
      );
      items.push(item);
    }
  }

  const comparatorFn = (item01: AssignedItem, item02: AssignedItem) => {
    // Delete existing assigned permission groups and re-assign it if the order
    // is changed.
    return item01.meta.order !== (item02 as AssignedItem).meta.order;
  };

  return await addAssignedItems(
    workspaceId,
    items,
    deleteExisting,
    comparatorFn,
    opts
  );
}
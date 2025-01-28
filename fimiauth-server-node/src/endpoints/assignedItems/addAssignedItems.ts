import {isArray} from 'lodash-es';
import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderQueryListParams,
} from '../../contexts/semantic/types.js';
import {AssignedItem} from '../../definitions/assignedItem.js';
import {kFimidaraPermissionActions} from '../../definitions/permissionItem.js';
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

async function filterExistingItems<T extends AssignedItem>(params: {
  spaceId: string;
  items: T[];
  /** Return `true` to delete existing item and include new item, and `false` to
   * not include item. */
  comparatorFn?: (item01: T, item02: AssignedItem) => boolean;
  opts: SemanticProviderQueryListParams<T>;
}) {
  const {spaceId, items, comparatorFn, opts} = params;
  const assigneeIdList: string[] = [];
  const assignedItemIdList: string[] = [];
  items.forEach(item => {
    assigneeIdList.push(item.assigneeId);
    assignedItemIdList.push(item.assignedItemId);
  });

  const existingItems = await kSemanticModels
    .assignedItem()
    .getByWorkspaceAssignedAndAssigneeIds({
      spaceId,
      assignedItemId: assignedItemIdList,
      assigneeId: assigneeIdList,
      options: opts,
    });

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

export async function addAssignedItems<T extends AssignedItem>(params: {
  spaceId: string;
  items: T[];
  /** No need to delete existing items */
  deletedExistingItems: boolean;
  comparatorFn: ((item01: T, item02: AssignedItem) => boolean) | undefined;
  opts: SemanticProviderMutationParams;
}) {
  const {spaceId, items, deletedExistingItems, comparatorFn, opts} = params;

  if (deletedExistingItems) {
    await kSemanticModels.assignedItem().insertItem(items, opts);
    return items;
  } else {
    const {itemIdListToDelete, resolvedItems} = await filterExistingItems({
      spaceId,
      items,
      comparatorFn,
      opts,
    });

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

export async function addAssignedPermissionGroupList(params: {
  agent: SessionAgent;
  workspaceId: string;
  spaceId: string;
  permissionGroupsInput: string[];
  assigneeId: string | string[];
  deleteExisting: boolean;
  skipPermissionGroupsExistCheck?: boolean;
  skipAuthCheck?: boolean;
  opts: SemanticProviderMutationParams;
}) {
  const {
    agent,
    workspaceId,
    spaceId,
    permissionGroupsInput,
    assigneeId,
    deleteExisting,
    skipPermissionGroupsExistCheck = false,
    skipAuthCheck = false,
    opts,
  } = params;

  if (deleteExisting) {
    await deleteResourceAssignedItems({
      spaceId,
      resourceId: assigneeId,
      assignedItemTypes: [kFimidaraResourceType.PermissionGroup],
      opts,
    });
  }

  if (!skipPermissionGroupsExistCheck) {
    await checkPermissionGroupsExist({
      spaceId,
      idList: permissionGroupsInput,
      opts,
    });
  }

  if (!skipAuthCheck) {
    await checkAuthorizationWithAgent({
      agent,
      opts,
      workspaceId,
      spaceId,
      target: {
        targetId: workspaceId,
        action: kFimidaraPermissionActions.updatePermission,
      },
    });
  }

  const idList = isArray(assigneeId) ? assigneeId : [assigneeId];
  const items: Array<AssignedItem> = [];

  for (const input of permissionGroupsInput) {
    for (const id of idList) {
      const item = withAssignedAgent(
        agent,
        newWorkspaceResource<AssignedItem>({
          agent,
          type: kFimidaraResourceType.AssignedItem,
          workspaceId,
          spaceId,
          seed: {
            meta: {},
            assigneeId: id,
            assigneeType: getResourceTypeFromId(id),
            resourceId: getNewIdForResource(kFimidaraResourceType.AssignedItem),
            assignedItemId: input,
            assignedItemType: kFimidaraResourceType.PermissionGroup,
          },
        })
      );

      items.push(item);
    }
  }

  const comparatorFn = (item01: AssignedItem, item02: AssignedItem) => {
    // Delete existing assigned permission groups and re-assign it if the order
    // is changed.
    return item01.meta.order !== (item02 as AssignedItem).meta.order;
  };

  return await addAssignedItems({
    spaceId,
    items,
    deletedExistingItems: deleteExisting,
    comparatorFn,
    opts,
  });
}

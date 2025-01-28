import {
  AssignedItem,
  AssignedItemMainFieldsMatcher,
} from '../../definitions/assignedItem.js';
import {AssignedPermissionGroupMeta} from '../../definitions/permissionGroups.js';
import {makeKey} from '../../utils/fns.js';
import {NotFoundError} from '../errors.js';

export function assignedItemToAssignedPermissionGroup(
  item: AssignedItem
): AssignedPermissionGroupMeta {
  return {
    permissionGroupId: item.assignedItemId,
    assignedAt: item.createdAt,
    assignedBy: item.createdBy,
    assigneeEntityId: item.assigneeId,
  };
}

export function assignedItemsToAssignedPermissionGroupList(
  items: AssignedItem[]
): AssignedPermissionGroupMeta[] {
  return items.map(assignedItemToAssignedPermissionGroup);
}

export function throwAssignedItemNotFound() {
  throw new NotFoundError('Assigned item not found');
}

export function assignedItemIndexer(item: AssignedItemMainFieldsMatcher) {
  return makeKey([item.workspaceId, item.assignedItemId, item.assigneeId]);
}

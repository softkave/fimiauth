import {AnyObject} from 'softkave-js-utils';
import {FimidaraResourceType, WorkspaceResource} from './system.js';

export interface AssignedItem<Meta extends AnyObject = AnyObject>
  extends WorkspaceResource {
  assignedItemId: string;
  assignedItemType: FimidaraResourceType;
  assigneeId: string;
  assigneeType: FimidaraResourceType;
  meta: Meta;
}

export type AssignedItemMainFieldsMatcher = Pick<
  AssignedItem,
  'assignedItemId' | 'assigneeId' | 'workspaceId'
>;

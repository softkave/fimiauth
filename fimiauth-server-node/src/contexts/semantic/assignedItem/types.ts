import {AssignedItem} from '../../../definitions/assignedItem.js';
import {Agent, FimidaraResourceType} from '../../../definitions/system.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticWorkspaceResourceProviderType,
} from '../types.js';

export interface SemanticAssignedItemProvider
  extends SemanticWorkspaceResourceProviderType<AssignedItem> {
  getByWorkspaceAssignedAndAssigneeIds(params: {
    spaceId: string;
    assignedItemId: string | string[];
    assigneeId: string | string[];
    options?: SemanticProviderQueryListParams<AssignedItem>;
  }): Promise<AssignedItem[]>;
  existsByWorkspaceAssignedAndAssigneeIds(params: {
    spaceId: string;
    assignedItemId: string | string[];
    assigneeId: string | string[];
    options?: SemanticProviderOpParams;
  }): Promise<boolean>;
  getByAssignee(params: {
    spaceId: string | undefined;
    assigneeId: string | string[];
    assignedItemType?: FimidaraResourceType | FimidaraResourceType[];
    options?: SemanticProviderQueryListParams<AssignedItem>;
  }): Promise<AssignedItem[]>;
  getByAssigned(params: {
    spaceId: string | undefined;
    assignedItemId: string | string[];
    options?: SemanticProviderQueryListParams<AssignedItem>;
  }): Promise<AssignedItem[]>;
  deleteByAssigned(params: {
    spaceId: string;
    assignedId: string | string[];
    assignedItemType: FimidaraResourceType | FimidaraResourceType[] | undefined;
    opts: SemanticProviderMutationParams;
  }): Promise<void>;
  /** Deletes items resource is assigned to. */
  deleteByAssignee(params: {
    spaceId: string;
    assigneeItemId: string | string[];
    opts: SemanticProviderMutationParams;
  }): Promise<void>;
  softDeleteWorkspaceCollaborators(params: {
    spaceId: string;
    assigneeId: string | string[];
    agent: Agent;
    opts: SemanticProviderMutationParams;
  }): Promise<void>;
}

import {convertToArray} from 'softkave-js-utils';
import {AssignedItem} from '../../../definitions/assignedItem.js';
import {Agent, FimidaraResourceType} from '../../../definitions/system.js';
import {DataQuery} from '../../data/types.js';
import {addIsDeletedIntoQuery} from '../SemanticBaseProvider.js';
import {SemanticWorkspaceResourceProvider} from '../SemanticWorkspaceResourceProvider.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
} from '../types.js';
import {SemanticAssignedItemProvider} from './types.js';

export class SemanticAssignedItem
  extends SemanticWorkspaceResourceProvider<AssignedItem>
  implements SemanticAssignedItemProvider
{
  async getByWorkspaceAssignedAndAssigneeIds(params: {
    spaceId: string;
    assignedItemId: string | string[];
    assigneeId: string | string[];
    options?: SemanticProviderQueryListParams<AssignedItem>;
  }): Promise<AssignedItem[]> {
    const {spaceId, assignedItemId, assigneeId, options} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {
        spaceId,
        assignedItemId: {$in: convertToArray(assignedItemId)},
        assigneeId: {$in: convertToArray(assigneeId)},
      },
      options?.includeDeleted || false
    );
    return await this.data.getManyByQuery(query, options);
  }

  async existsByWorkspaceAssignedAndAssigneeIds(params: {
    spaceId: string;
    assignedItemId: string | string[];
    assigneeId: string | string[];
    options?: SemanticProviderOpParams;
  }): Promise<boolean> {
    const {spaceId, assignedItemId, assigneeId, options} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {
        spaceId,
        assignedItemId: {$in: convertToArray(assignedItemId)},
        assigneeId: {$in: convertToArray(assigneeId)},
      },
      options?.includeDeleted || false
    );
    return await this.data.existsByQuery(query, options);
  }

  async getByAssignee(params: {
    spaceId: string | undefined;
    assigneeId: string | string[];
    assignedItemType?: FimidaraResourceType | FimidaraResourceType[];
    options?: SemanticProviderQueryListParams<AssignedItem>;
  }): Promise<AssignedItem[]> {
    const {spaceId, assigneeId, assignedItemType, options} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {
        spaceId,
        assigneeId: {$in: convertToArray(assigneeId)},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignedItemType: {$in: convertToArray(assignedItemType) as any},
      },
      options?.includeDeleted || false
    );
    return await this.data.getManyByQuery(query, options);
  }

  async getByAssigned(params: {
    spaceId: string | undefined;
    assignedItemId: string | string[];
    options?: SemanticProviderQueryListParams<AssignedItem>;
  }): Promise<AssignedItem[]> {
    const {spaceId, assignedItemId, options} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {spaceId, assignedItemId: {$in: convertToArray(assignedItemId)}},
      options?.includeDeleted || false
    );
    return await this.data.getManyByQuery(query, options);
  }

  async deleteByAssigned(params: {
    spaceId: string;
    assignedId: string | string[];
    assignedItemType: FimidaraResourceType | FimidaraResourceType[] | undefined;
    opts: SemanticProviderMutationParams;
  }): Promise<void> {
    const {spaceId, assignedId, assignedItemType, opts} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {
        spaceId,
        assignedItemId: {$in: convertToArray(assignedId)},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignedItemType: {$in: convertToArray(assignedItemType) as any},
      },
      opts?.includeDeleted || true
    );
    await this.data.deleteManyByQuery(query, opts);
  }

  /** Deletes items resource is assigned to. */
  async deleteByAssignee(params: {
    spaceId: string;
    assigneeItemId: string | string[];
    opts: SemanticProviderMutationParams;
  }): Promise<void> {
    const {spaceId, assigneeItemId, opts} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {spaceId, assignedItemId: {$in: convertToArray(assigneeItemId)}},
      opts?.includeDeleted || true
    );
    await this.data.deleteManyByQuery(query, opts);
  }

  async softDeleteWorkspaceCollaborators(params: {
    spaceId: string;
    assigneeId: string | string[];
    agent: Agent;
    opts: SemanticProviderMutationParams;
  }): Promise<void> {
    const {spaceId, assigneeId, agent, opts} = params;
    const query = addIsDeletedIntoQuery<DataQuery<AssignedItem>>(
      {spaceId, assigneeId: {$in: convertToArray(assigneeId)}},
      opts?.includeDeleted || true
    );
    await this.softDeleteManyByQuery(query, agent, opts);
  }
}

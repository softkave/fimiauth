import {CollaborationRequest} from '../../../definitions/collaborationRequest.js';
import {Resource} from '../../../definitions/system.js';
import {DataQuery} from '../../data/types.js';
import {addIsDeletedIntoQuery} from '../SemanticBaseProvider.js';
import {SemanticWorkspaceResourceProvider} from '../SemanticWorkspaceResourceProvider.js';
import {
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
} from '../types.js';
import {getIgnoreCaseDataQueryRegExp, getInAndNinQuery} from '../utils.js';
import {
  SemanticCollaborationRequestProvider,
  SemanticCollaborationRequestProviderFilter,
} from './types.js';

export class SemanticCollaborationRequest
  extends SemanticWorkspaceResourceProvider<CollaborationRequest>
  implements SemanticCollaborationRequestProvider
{
  async countByEmail(
    spaceId: string,
    email: string,
    opts?: SemanticProviderOpParams | undefined
  ): Promise<number> {
    const query = addIsDeletedIntoQuery<DataQuery<CollaborationRequest>>(
      {spaceId, recipientEmail: getIgnoreCaseDataQueryRegExp(email)},
      opts?.includeDeleted || false
    );
    return await this.data.countByQuery(query, opts);
  }

  async getOneByEmail(
    spaceId: string,
    email: string,
    opts?: SemanticProviderQueryParams<CollaborationRequest> | undefined
  ): Promise<CollaborationRequest | null> {
    const query = addIsDeletedIntoQuery<DataQuery<CollaborationRequest>>(
      {spaceId, recipientEmail: getIgnoreCaseDataQueryRegExp(email)},
      opts?.includeDeleted || false
    );
    return await this.data.getOneByQuery(query, opts);
  }

  async getManyByEmail(
    spaceId: string,
    email: string,
    options?: SemanticProviderQueryListParams<CollaborationRequest> | undefined
  ): Promise<CollaborationRequest[]> {
    const query = addIsDeletedIntoQuery<DataQuery<CollaborationRequest>>(
      {spaceId, recipientEmail: getIgnoreCaseDataQueryRegExp(email)},
      options?.includeDeleted || false
    );
    return await this.data.getManyByQuery(query, options);
  }

  async getManyByFilter(
    query: SemanticCollaborationRequestProviderFilter,
    options?: SemanticProviderQueryListParams<CollaborationRequest> | undefined
  ): Promise<CollaborationRequest[]> {
    const dataQuery = addIsDeletedIntoQuery<DataQuery<CollaborationRequest>>(
      {
        spaceId: query.spaceId,
        ...getInAndNinQuery<Resource>(
          'resourceId',
          query.resourceIdList,
          query.excludeResourceIdList
        ),
      },
      options?.includeDeleted || false
    );

    if (query.email) {
      dataQuery.recipientEmail = getIgnoreCaseDataQueryRegExp(query.email);
    }

    return await this.data.getManyByQuery(dataQuery, options);
  }

  async countManyByFilter(
    query: SemanticCollaborationRequestProviderFilter,
    opts?: SemanticProviderOpParams
  ): Promise<number> {
    const dataQuery = addIsDeletedIntoQuery<DataQuery<CollaborationRequest>>(
      {
        spaceId: query.spaceId,
        ...getInAndNinQuery<Resource>(
          'resourceId',
          query.resourceIdList,
          query.excludeResourceIdList
        ),
      },
      opts?.includeDeleted || false
    );

    if (query.email) {
      dataQuery.recipientEmail = getIgnoreCaseDataQueryRegExp(query.email);
    }

    return await this.data.countByQuery(dataQuery, opts);
  }
}

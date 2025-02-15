import {Resource} from '../../definitions/system.js';
import {DataQuery} from '../data/types.js';
import {
  SemanticBaseProvider,
  addIsDeletedIntoQuery,
} from './SemanticBaseProvider.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
  SemanticWorkspaceResourceProviderBaseType,
  SemanticWorkspaceResourceProviderType,
} from './types.js';
import {getIgnoreCaseDataQueryRegExp, getInAndNinQuery} from './utils.js';

export class SemanticWorkspaceResourceProvider<
    T extends SemanticWorkspaceResourceProviderBaseType,
  >
  extends SemanticBaseProvider<T>
  implements SemanticWorkspaceResourceProviderType<T>
{
  async getByName(
    params: {spaceId: string; name: string},
    opts?: SemanticProviderQueryParams<T> | undefined
  ): Promise<T | null> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {
        spaceId: params.spaceId,
        name: getIgnoreCaseDataQueryRegExp(params.name),
      },
      opts?.includeDeleted || false
    );

    return (await this.data.getOneByQuery(
      query as DataQuery<T>,
      opts
    )) as T | null;
  }

  async existsByName(
    params: {spaceId: string; name: string},
    opts?: SemanticProviderOpParams | undefined
  ): Promise<boolean> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {
        spaceId: params.spaceId,
        name: getIgnoreCaseDataQueryRegExp(params.name),
      },
      opts?.includeDeleted || false
    );

    return await this.data.existsByQuery(query as DataQuery<T>, opts);
  }

  async getByProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderQueryParams<T> | undefined
  ): Promise<T | null> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {
        spaceId: params.spaceId,
        providedResourceId: params.providedId,
      },
      opts?.includeDeleted || false
    );

    return (await this.data.getOneByQuery(
      query as DataQuery<T>,
      opts
    )) as T | null;
  }

  async existsByProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderOpParams | undefined
  ): Promise<boolean> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {
        spaceId: params.spaceId,
        providedResourceId: params.providedId,
      },
      opts?.includeDeleted || false
    );

    return await this.data.existsByQuery(query as DataQuery<T>, opts);
  }

  async deleteManyByWorkspaceId(
    params: {spaceId: string},
    opts: SemanticProviderMutationParams
  ): Promise<void> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >({spaceId: params.spaceId}, opts?.includeDeleted || true);

    await this.data.deleteManyByQuery(query as DataQuery<T>, opts);
  }

  async getManyByWorkspaceId(
    params: {spaceId: string},
    opts?: SemanticProviderQueryListParams<T> | undefined
  ): Promise<T[]> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >({spaceId: params.spaceId}, opts?.includeDeleted || false);

    return (await this.data.getManyByQuery(query as DataQuery<T>, opts)) as T[];
  }

  async countManyByIdList(
    idList: string[],
    opts?: SemanticProviderOpParams | undefined
  ): Promise<number> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >({resourceId: {$in: idList}}, opts?.includeDeleted || false);

    return await this.data.countByQuery(query as DataQuery<T>, opts);
  }

  async countManyByWorkspaceAndIdList(
    query: {
      workspaceId: string;
      resourceIdList?: string[] | undefined;
      excludeResourceIdList?: string[] | undefined;
    },
    opts?: SemanticProviderOpParams | undefined
  ): Promise<number> {
    const countQuery: DataQuery<SemanticWorkspaceResourceProviderBaseType> =
      addIsDeletedIntoQuery(
        {
          workspaceId: query.workspaceId,
          ...getInAndNinQuery<Resource>(
            'resourceId',
            query.resourceIdList,
            query.excludeResourceIdList
          ),
        },
        opts?.includeDeleted || false
      );

    return await this.data.countByQuery(countQuery as DataQuery<T>, opts);
  }

  async getManyByWorkspaceAndIdList(
    query: {
      workspaceId: string;
      resourceIdList?: string[] | undefined;
      excludeResourceIdList?: string[] | undefined;
    },
    opts?: SemanticProviderQueryListParams<T> | undefined
  ): Promise<T[]> {
    const getQuery: DataQuery<SemanticWorkspaceResourceProviderBaseType> =
      addIsDeletedIntoQuery(
        {
          workspaceId: query.workspaceId,
          ...getInAndNinQuery<Resource>(
            'resourceId',
            query.resourceIdList,
            query.excludeResourceIdList
          ),
        },
        opts?.includeDeleted || false
      );

    return (await this.data.getManyByQuery(
      getQuery as DataQuery<T>,
      opts
    )) as T[];
  }

  async getBySpaceIdAndProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderQueryParams<T> | undefined
  ): Promise<T | null> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {
        spaceId: params.spaceId,
        providedResourceId: params.providedId,
      },
      opts?.includeDeleted || false
    );

    return (await this.data.getOneByQuery(
      query as DataQuery<T>,
      opts
    )) as T | null;
  }

  async existsBySpaceIdAndProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderOpParams | undefined
  ): Promise<boolean> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {spaceId: params.spaceId, providedResourceId: params.providedId},
      opts?.includeDeleted || false
    );

    return await this.data.existsByQuery(query as DataQuery<T>, opts);
  }

  async getManyBySpaceId(
    params: {spaceId: string},
    opts?: SemanticProviderQueryListParams<T> | undefined
  ): Promise<T[]> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >({spaceId: params.spaceId}, opts?.includeDeleted || false);

    return (await this.data.getManyByQuery(query as DataQuery<T>, opts)) as T[];
  }

  async deleteManyBySpaceId(
    params: {spaceId: string},
    opts: SemanticProviderMutationParams
  ): Promise<void> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >({spaceId: params.spaceId}, opts?.includeDeleted || true);

    await this.data.deleteManyByQuery(query as DataQuery<T>, opts);
  }

  async getManyBySpaceAndIdList(
    params: {
      spaceId: string;
      resourceIdList?: string[] | undefined;
      excludeResourceIdList?: string[] | undefined;
    },
    opts?: SemanticProviderQueryListParams<T> | undefined
  ): Promise<T[]> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >(
      {
        spaceId: params.spaceId,
        ...getInAndNinQuery<Resource>(
          'resourceId',
          params.resourceIdList,
          params.excludeResourceIdList
        ),
      },
      opts?.includeDeleted || false
    );

    return (await this.data.getManyByQuery(query as DataQuery<T>, opts)) as T[];
  }

  async countManyBySpaceAndIdList(
    query: {
      spaceId: string;
      resourceIdList?: string[] | undefined;
      excludeResourceIdList?: string[] | undefined;
    },
    opts?: SemanticProviderOpParams | undefined
  ): Promise<number> {
    const countQuery: DataQuery<SemanticWorkspaceResourceProviderBaseType> =
      addIsDeletedIntoQuery(
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

    return await this.data.countByQuery(countQuery as DataQuery<T>, opts);
  }

  async countBySpaceId(
    params: {spaceId: string},
    opts?: SemanticProviderOpParams | undefined
  ): Promise<number> {
    const query = addIsDeletedIntoQuery<
      DataQuery<SemanticWorkspaceResourceProviderBaseType>
    >({spaceId: params.spaceId}, opts?.includeDeleted || false);

    return await this.data.countByQuery(query as DataQuery<T>, opts);
  }
}

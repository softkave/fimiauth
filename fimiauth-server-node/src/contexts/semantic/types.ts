import {App} from '../../definitions/app.js';
import {Collaborator} from '../../definitions/collaborator.js';
import {PermissionGroup} from '../../definitions/permissionGroups.js';
import {Space} from '../../definitions/space.js';
import {Agent, Resource} from '../../definitions/system.js';
import {AnyFn} from '../../utils/types.js';
import {
  DataProviderOpParams,
  DataProviderQueryListParams,
  DataProviderQueryParams,
  DataQuery,
} from '../data/types.js';

export interface SemanticProviderOpParams extends DataProviderOpParams {
  /** Defaults to `false` for query ops, `undefined` for mutation ops (affecting
   * both soft-deleted and active items), and `false` for getAndUpdate ops */
  includeDeleted?: boolean;
}

export interface SemanticProviderMutationParams
  extends SemanticProviderOpParams {
  txn: unknown;
}

export interface SemanticProviderQueryParams<
  TResource extends Partial<Resource>,
> extends SemanticProviderOpParams,
    DataProviderQueryParams<TResource> {}

export interface SemanticProviderQueryListParams<TResource extends Resource>
  extends SemanticProviderOpParams,
    DataProviderQueryListParams<TResource> {}

export interface SemanticBaseProviderType<TResource extends Resource> {
  insertItem(
    item: TResource | TResource[],
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  getOneById(
    id: string,
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<TResource | null>;
  getManyByIdList(
    idList: string[],
    options?: SemanticProviderQueryListParams<TResource>
  ): Promise<TResource[]>;
  countManyByIdList(
    idList: string[],
    opts?: SemanticProviderOpParams
  ): Promise<number>;
  existsById(id: string, opts?: SemanticProviderOpParams): Promise<boolean>;
  updateOneById(
    id: string,
    update: Partial<TResource>,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  updateManyByQuery(
    query: DataQuery<TResource>,
    update: Partial<TResource>,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  getAndUpdateOneById(
    id: string,
    update: Partial<TResource>,
    opts: SemanticProviderMutationParams &
      SemanticProviderQueryParams<TResource>
  ): Promise<TResource | null>;
  deleteOneById(
    id: string,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  deleteManyByIdList(
    idList: string[],
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  softDeleteManyByIdList(
    idList: string[],
    agent: Agent,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  getOneByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<TResource | null>;
  getManyByQuery(
    query: DataQuery<TResource>,
    options?: SemanticProviderQueryListParams<TResource>
  ): Promise<TResource[]>;
  countByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderOpParams
  ): Promise<number>;
  assertGetOneByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<TResource>;
  existsByQuery(
    query: DataQuery<TResource>,
    opts?: SemanticProviderOpParams
  ): Promise<boolean>;
  deleteManyByQuery(
    query: DataQuery<TResource>,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
}

export type SemanticWorkspaceResourceProviderBaseType = Resource & {
  spaceId?: string | null;
  providedResourceId?: string | null;
  name?: string;
};

export interface SemanticWorkspaceResourceProviderType<
  TResource extends SemanticWorkspaceResourceProviderBaseType,
> extends SemanticBaseProviderType<TResource> {
  getByName(
    params: {spaceId: string; name: string},
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<TResource | null>;
  existsByName(
    params: {spaceId: string; name: string},
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<boolean>;
  getByProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<TResource | null>;
  getBySpaceIdAndProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<TResource | null>;
  existsByProvidedId(
    params: {spaceId: string; providedId: string},
    opts?: SemanticProviderQueryParams<TResource>
  ): Promise<boolean>;
  getManyBySpaceId(
    params: {spaceId: string},
    opts?: SemanticProviderQueryListParams<TResource>
  ): Promise<TResource[]>;
  deleteManyBySpaceId(
    params: {spaceId: string},
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  getManyBySpaceAndIdList(
    params: {
      spaceId: string;
      resourceIdList?: string[];
      excludeResourceIdList?: string[];
    },
    opts?: SemanticProviderQueryListParams<TResource>
  ): Promise<TResource[]>;
  countManyBySpaceAndIdList(
    query: {
      spaceId: string;
      resourceIdList?: string[];
      excludeResourceIdList?: string[];
    },
    opts?: SemanticProviderOpParams
  ): Promise<number>;
  countBySpaceId(
    params: {spaceId: string},
    opts?: SemanticProviderOpParams
  ): Promise<number>;
}

export interface ISemanticProviderUtils {
  useTxnId(txn: unknown): string | undefined;
  withTxn<TResult>(
    fn: AnyFn<[SemanticProviderMutationParams], Promise<TResult>>,
    opts?: SemanticProviderMutationParams
  ): Promise<TResult>;
}

export type SemanticAppProvider = SemanticWorkspaceResourceProviderType<App>;

export interface SemanticPermissionGroupProviderType
  extends SemanticWorkspaceResourceProviderType<PermissionGroup> {}

export interface SemanticCollaboratorProvider
  extends SemanticWorkspaceResourceProviderType<Collaborator> {}

export interface SemanticSpaceProvider
  extends SemanticWorkspaceResourceProviderType<Space> {}

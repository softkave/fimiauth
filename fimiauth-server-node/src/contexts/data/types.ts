import {ProjectionType, SortOrder} from 'mongoose';
import {AnyFn, AnyObject} from 'softkave-js-utils';
import {Primitive} from 'type-fest';
import {AgentToken} from '../../definitions/agentToken.js';
import {App, AppShard} from '../../definitions/app.js';
import {AssignedItem} from '../../definitions/assignedItem.js';
import {CollaborationRequest} from '../../definitions/collaborationRequest.js';
import {Collaborator} from '../../definitions/collaborator.js';
import {EmailBlocklist, EmailMessage} from '../../definitions/email.js';
import {Job} from '../../definitions/job.js';
import {JobHistory} from '../../definitions/jobHistory.js';
import {PermissionGroup} from '../../definitions/permissionGroups.js';
import {PermissionItem} from '../../definitions/permissionItem.js';
import {Space} from '../../definitions/space.js';
import {Resource, ResourceWrapper} from '../../definitions/system.js';
import {Workspace} from '../../definitions/workspace.js';

export type DataQuerySort<T, K extends keyof T = keyof T> = {
  [P in K]?: SortOrder;
};

export interface DataProviderOpParams {
  txn?: unknown;
}

export interface DataProviderQueryParams<T> extends DataProviderOpParams {
  // TODO: Pick projection fields and return only projection fields in data and
  // semantic APIs
  projection?: ProjectionType<T>;
}

export interface DataProviderQueryListParams<T>
  extends DataProviderQueryParams<T> {
  /** zero-based index */
  page?: number;
  pageSize?: number;
  sort?: DataQuerySort<T>;
}

export const kIncludeInProjection = 1 as const;
export const kExcludeFromProjection = 0 as const;

export type DataProviderLiteralType = Primitive | Date;

export interface ComparisonLiteralFieldQueryOps<T = DataProviderLiteralType> {
  $eq?: T | null;
  $in?: Array<T | null>;
  $ne?: T | null;
  $nin?: Array<T | null>;

  // TODO: implement $not and in which bracket should it go?
  // $not?: T;
  $exists?: boolean;
  $regex?: T extends string ? string | RegExp : never;
  $options?: T extends string ? string : never;
}

/**
 * Can also be used to query dates in Mongo.
 */
export interface NumberLiteralFieldQueryOps {
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
}

export type LiteralFieldQueryOps<T = DataProviderLiteralType> =
  | (T extends DataProviderLiteralType
      ? ComparisonLiteralFieldQueryOps<T> | NumberLiteralFieldQueryOps | T
      : never)
  | null;

export type LiteralDataQuery<T> = {
  [P in keyof T]?: ExpandDataQuery<Exclude<T[P], undefined>>;
};

export interface RecordFieldQueryOps<T extends AnyObject> {
  $objMatch: LiteralDataQuery<T>;
}

export interface ElemMatchFieldQueryOps<T> {
  $elemMatch?: T extends AnyObject ? LiteralDataQuery<T> : never;
}

export interface ArrayFieldQueryOps<T> extends ElemMatchFieldQueryOps<T> {
  $size?: number;
  $all?: T extends DataProviderLiteralType
    ? T[]
    : T extends AnyObject
      ? ElemMatchFieldQueryOps<T>[]
      : never;
  $eq?: (T extends DataProviderLiteralType ? T | T[] : never) | null;
}

export interface FieldLogicalQueryOps<T> {
  $not?: ExpandDataQuery<T, true>;
}

export interface LogicalQueryOps<T> {
  $and?: LiteralDataQuery<T>[];
  $nor?: LiteralDataQuery<T>[];
  $or?: LiteralDataQuery<T>[];
}

type ExpandDataQuery<TValue, TExcludeFieldLogical extends boolean = false> =
  | (Exclude<TValue, undefined> extends DataProviderLiteralType
      ? TValue | LiteralFieldQueryOps<TValue>
      : never)
  | (TExcludeFieldLogical extends false ? FieldLogicalQueryOps<TValue> : never)
  | (NonNullable<TValue> extends Array<infer TArrayItem>
      ?
          | ArrayFieldQueryOps<TArrayItem>
          | (TArrayItem extends AnyObject
              ? RecordFieldQueryOps<TArrayItem>
              : never)
          | (TArrayItem extends DataProviderLiteralType ? TArrayItem : never)
      : NonNullable<TValue> extends AnyObject
        ? RecordFieldQueryOps<NonNullable<TValue>>
        : never);

export type DataQuery<T> = LiteralDataQuery<T> & LogicalQueryOps<T>;

export type KeyedComparisonOps<TData extends AnyObject> =
  keyof TData extends string
    ? `${keyof TData}.${keyof ComparisonLiteralFieldQueryOps}`
    : '';

export enum BulkOpType {
  InsertOne = 1,
  ReplaceOne,
  UpdateOne,
  UpdateMany,
  DeleteOne,
  DeleteMany,
}

export type BulkOpItem<T> =
  | {type: BulkOpType.InsertOne; item: T}
  | {
      type: BulkOpType.UpdateOne;
      query: DataQuery<T>;
      update: Partial<T>;
      upsert?: boolean;
    }
  | {
      type: BulkOpType.UpdateMany;
      query: DataQuery<T>;
      update: Partial<T>;
    }
  | {type: BulkOpType.DeleteOne; query: DataQuery<T>}
  | {type: BulkOpType.DeleteMany; query: DataQuery<T>};

// TODO: infer resulting type from projection, otherwise default to full object
export interface BaseDataProvider<
  TData,
  TQuery extends DataQuery<TData> = DataQuery<TData>,
> {
  insertItem: (
    item: TData,
    otherProps?: DataProviderOpParams
  ) => Promise<TData>;
  insertList: (
    items: TData[],
    otherProps?: DataProviderOpParams
  ) => Promise<void>;
  existsByQuery: <ExtendedQueryType extends TQuery = TQuery>(
    query: ExtendedQueryType,
    otherProps?: DataProviderOpParams
  ) => Promise<boolean>;
  getManyByQuery: (
    query: TQuery,
    otherProps?: DataProviderQueryListParams<TData>
  ) => Promise<TData[]>;
  getOneByQuery: (
    query: TQuery,
    otherProps?: DataProviderQueryParams<TData>
  ) => Promise<TData | null>;
  assertGetOneByQuery: (
    query: TQuery,
    otherProps?: DataProviderQueryParams<TData>
  ) => Promise<TData>;
  assertGetAndUpdateOneByQuery: (
    query: TQuery,
    data: Partial<TData>,
    otherProps?: DataProviderQueryParams<TData>
  ) => Promise<TData>;
  countByQuery: <ExtendedQueryType extends TQuery = TQuery>(
    query: ExtendedQueryType,
    otherProps?: DataProviderOpParams
  ) => Promise<number>;
  updateManyByQuery: (
    query: TQuery,
    data: Partial<TData>,
    otherProps?: DataProviderOpParams
  ) => Promise<void>;
  updateOneByQuery: (
    query: TQuery,
    data: Partial<TData>,
    otherProps?: DataProviderOpParams
  ) => Promise<void>;
  getAndUpdateOneByQuery: (
    query: TQuery,
    data: Partial<TData>,
    otherProps?: DataProviderQueryParams<TData>
  ) => Promise<TData | null>;
  deleteManyByQuery: <TOpQuery extends TQuery = TQuery>(
    query: TOpQuery,
    otherProps?: DataProviderOpParams
  ) => Promise<void>;
  deleteOneByQuery: <ExtendedQueryType extends TQuery = TQuery>(
    query: ExtendedQueryType,
    otherProps?: DataProviderOpParams
  ) => Promise<void>;
  bulkWrite(
    ops: Array<BulkOpItem<TData>>,
    otherProps?: DataProviderOpParams
  ): Promise<void>;
}

export interface DataProviderUtils {
  withTxn<TResult>(
    fn: AnyFn<[txn: unknown], Promise<TResult>>,
    existingSession?: unknown
  ): Promise<TResult>;
}

export type AgentTokenQuery = DataQuery<AgentToken>;
export type AssignedItemQuery<T extends AnyObject = AnyObject> = DataQuery<
  AssignedItem<T>
>;
export type CollaborationRequestQuery = DataQuery<CollaborationRequest>;
export type PermissionGroupQuery = DataQuery<PermissionGroup>;
export type PermissionItemQuery = DataQuery<PermissionItem>;
export type WorkspaceQuery = DataQuery<Workspace>;
export type AppQuery = DataQuery<App>;
export type EmailMessageQuery = DataQuery<EmailMessage>;
export type EmailBlocklistQuery = DataQuery<EmailBlocklist>;
export type AppShardQuery = DataQuery<AppShard>;
export type JobHistoryQuery = DataQuery<JobHistory>;

export type AgentTokenDataProvider = BaseDataProvider<
  AgentToken,
  DataQuery<AgentToken>
>;
export type AssignedItemDataProvider = BaseDataProvider<
  AssignedItem,
  DataQuery<AssignedItem>
>;
export type CollaborationRequestDataProvider = BaseDataProvider<
  CollaborationRequest,
  DataQuery<CollaborationRequest>
>;
export type PermissionGroupDataProvider = BaseDataProvider<
  PermissionGroup,
  DataQuery<PermissionGroup>
>;
export type PermissionItemDataProvider = BaseDataProvider<
  PermissionItem,
  DataQuery<PermissionItem>
>;
export type WorkspaceDataProvider = BaseDataProvider<
  Workspace,
  DataQuery<Workspace>
>;
export type ResourceDataProvider = BaseDataProvider<
  ResourceWrapper,
  DataQuery<Resource>
>;
export type JobDataProvider = BaseDataProvider<Job, DataQuery<Job>>;
export type AppDataProvider = BaseDataProvider<App, DataQuery<App>>;
export type EmailMessageDataProvider = BaseDataProvider<
  EmailMessage,
  DataQuery<EmailMessage>
>;
export type EmailBlocklistDataProvider = BaseDataProvider<
  EmailBlocklist,
  DataQuery<EmailBlocklist>
>;
export type AppShardDataProvider = BaseDataProvider<
  AppShard,
  DataQuery<AppShard>
>;
export type JobHistoryDataProvider = BaseDataProvider<
  JobHistory,
  DataQuery<JobHistory>
>;
export type CollaboratorDataProvider = BaseDataProvider<
  Collaborator,
  DataQuery<Collaborator>
>;
export type SpaceDataProvider = BaseDataProvider<Space, DataQuery<Space>>;

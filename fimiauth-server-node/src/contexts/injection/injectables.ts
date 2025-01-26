import {Redis} from 'ioredis';
import {RedisClientType} from 'redis';
import 'reflect-metadata';
import {
  DisposablesStore,
  LockStore,
  Logger,
  PromiseStore,
} from 'softkave-js-utils';
import {container} from 'tsyringe';
import {DbConnection} from '../../db/connection.js';
import {FimidaraApp} from '../../endpoints/app/FimidaraApp.js';
import {FimidaraWorkerPool} from '../../endpoints/jobs/fimidaraWorker/FimidaraWorkerPool.js';
import {
  FimidaraRuntimeConfig,
  FimidaraSuppliedConfig,
} from '../../resources/config.js';
import {ShardedRunner} from '../../utils/shardedRunnerQueue.js';
import {SessionContextType} from '../SessionContext.js';
import {AsyncLocalStorageUtils} from '../asyncLocalStorage.js';
import {ICacheContext} from '../cache/types.js';
import {
  AgentTokenDataProvider,
  AppDataProvider,
  AppRuntimeStateDataProvider,
  AppShardDataProvider,
  AssignedItemDataProvider,
  CollaborationRequestDataProvider,
  DataProviderUtils,
  EmailBlocklistDataProvider,
  EmailMessageDataProvider,
  JobDataProvider,
  JobHistoryDataProvider,
  PermissionGroupDataProvider,
  PermissionItemDataProvider,
  WorkspaceDataProvider,
} from '../data/types.js';
import {IDSetContext} from '../dset/types.js';
import {IEmailProviderContext} from '../email/types.js';
import {IPubSubContext} from '../pubsub/types.js';
import {IQueueContext} from '../queue/types.js';
import {IRedlockContext} from '../redlock/types.js';
import {IServerRuntimeState} from '../runtime.js';
import {SecretsManagerProvider} from '../secrets/types.js';
import {SemanticAgentTokenProvider} from '../semantic/agentToken/types.js';
import {SemanticAppShardProvider} from '../semantic/app/types.js';
import {SemanticAssignedItemProvider} from '../semantic/assignedItem/types.js';
import {SemanticCollaborationRequestProvider} from '../semantic/collaborationRequest/types.js';
import {
  SemanticEmailBlocklistProvider,
  SemanticEmailMessageProvider,
} from '../semantic/email/types.js';
import {SemanticJobProvider} from '../semantic/job/types.js';
import {SemanticJobHistoryProvider} from '../semantic/jobHistory/types.js';
import {SemanticPermissionProviderType} from '../semantic/permission/types.js';
import {SemanticPermissionItemProviderType} from '../semantic/permissionItem/types.js';
import {
  SemanticAppProvider,
  SemanticPermissionGroupProviderType,
  SemanticProviderUtils,
} from '../semantic/types.js';
import {SemanticWorkspaceProviderType} from '../semantic/workspace/types.js';
import {IUsageContext} from '../usage/types.js';
import {kInjectionKeys} from './keys.js';

export const kSemanticModels = {
  agentToken: () =>
    container.resolve<SemanticAgentTokenProvider>(
      kInjectionKeys.semantic.agentToken
    ),
  workspace: () =>
    container.resolve<SemanticWorkspaceProviderType>(
      kInjectionKeys.semantic.workspace
    ),
  collaborationRequest: () =>
    container.resolve<SemanticCollaborationRequestProvider>(
      kInjectionKeys.semantic.collaborationRequest
    ),
  permissions: () =>
    container.resolve<SemanticPermissionProviderType>(
      kInjectionKeys.semantic.permissions
    ),
  permissionGroup: () =>
    container.resolve<SemanticPermissionGroupProviderType>(
      kInjectionKeys.semantic.permissionGroup
    ),
  permissionItem: () =>
    container.resolve<SemanticPermissionItemProviderType>(
      kInjectionKeys.semantic.permissionItem
    ),
  assignedItem: () =>
    container.resolve<SemanticAssignedItemProvider>(
      kInjectionKeys.semantic.assignedItem
    ),
  job: () =>
    container.resolve<SemanticJobProvider>(kInjectionKeys.semantic.job),
  app: () =>
    container.resolve<SemanticAppProvider>(kInjectionKeys.semantic.app),
  emailMessage: () =>
    container.resolve<SemanticEmailMessageProvider>(
      kInjectionKeys.semantic.emailMessage
    ),
  emailBlocklist: () =>
    container.resolve<SemanticEmailBlocklistProvider>(
      kInjectionKeys.semantic.emailBlocklist
    ),
  appShard: () =>
    container.resolve<SemanticAppShardProvider>(
      kInjectionKeys.semantic.appShard
    ),
  jobHistory: () =>
    container.resolve<SemanticJobHistoryProvider>(
      kInjectionKeys.semantic.jobHistory
    ),
  utils: () =>
    container.resolve<SemanticProviderUtils>(kInjectionKeys.semantic.utils),
};

export const kDataModels = {
  agentToken: () =>
    container.resolve<AgentTokenDataProvider>(kInjectionKeys.data.agentToken),
  workspace: () =>
    container.resolve<WorkspaceDataProvider>(kInjectionKeys.data.workspace),
  permissionGroup: () =>
    container.resolve<PermissionGroupDataProvider>(
      kInjectionKeys.data.permissionGroup
    ),
  permissionItem: () =>
    container.resolve<PermissionItemDataProvider>(
      kInjectionKeys.data.permissionItem
    ),
  assignedItem: () =>
    container.resolve<AssignedItemDataProvider>(
      kInjectionKeys.data.assignedItem
    ),
  job: () => container.resolve<JobDataProvider>(kInjectionKeys.data.job),
  appRuntimeState: () =>
    container.resolve<AppRuntimeStateDataProvider>(
      kInjectionKeys.data.appRuntimeState
    ),
  collaborationRequest: () =>
    container.resolve<CollaborationRequestDataProvider>(
      kInjectionKeys.data.collaborationRequest
    ),
  app: () => container.resolve<AppDataProvider>(kInjectionKeys.data.app),
  emailMessage: () =>
    container.resolve<EmailMessageDataProvider>(
      kInjectionKeys.data.emailMessage
    ),
  emailBlocklist: () =>
    container.resolve<EmailBlocklistDataProvider>(
      kInjectionKeys.data.emailBlocklist
    ),
  appShard: () =>
    container.resolve<AppShardDataProvider>(kInjectionKeys.data.appShard),
  jobHistory: () =>
    container.resolve<JobHistoryDataProvider>(kInjectionKeys.data.jobHistory),
  utils: () => container.resolve<DataProviderUtils>(kInjectionKeys.data.utils),
};

export const kUtilsInjectables = {
  // config: () => container.resolve<FimidaraConfig>(kInjectionKeys.config),
  suppliedConfig: () =>
    container.resolve<FimidaraSuppliedConfig>(kInjectionKeys.suppliedConfig),
  runtimeConfig: () =>
    container.resolve<FimidaraRuntimeConfig>(kInjectionKeys.runtimeConfig),
  runtimeState: () =>
    container.resolve<IServerRuntimeState>(kInjectionKeys.runtimeState),
  secretsManager: () =>
    container.resolve<SecretsManagerProvider>(kInjectionKeys.secretsManager),
  asyncLocalStorage: () =>
    container.resolve<AsyncLocalStorageUtils>(kInjectionKeys.asyncLocalStorage),
  session: () => container.resolve<SessionContextType>(kInjectionKeys.session),
  dbConnection: () =>
    container.resolve<DbConnection>(kInjectionKeys.dbConnection),
  email: () => container.resolve<IEmailProviderContext>(kInjectionKeys.email),
  promises: () => container.resolve<PromiseStore>(kInjectionKeys.promises),
  locks: () => container.resolve<LockStore>(kInjectionKeys.locks),
  disposables: () =>
    container.resolve<DisposablesStore>(kInjectionKeys.disposables),
  logger: () => container.resolve<Logger>(kInjectionKeys.logger),
  shardedRunner: () =>
    container.resolve<ShardedRunner>(kInjectionKeys.shardedRunner),
  serverApp: () => container.resolve<FimidaraApp>(kInjectionKeys.serverApp),
  workerPool: () =>
    container.resolve<FimidaraWorkerPool>(kInjectionKeys.workerPool),
  queue: () => container.resolve<IQueueContext>(kInjectionKeys.queue),
  pubsub: () => container.resolve<IPubSubContext>(kInjectionKeys.pubsub),
  cache: () => container.resolve<ICacheContext>(kInjectionKeys.cache),
  redlock: () => container.resolve<IRedlockContext>(kInjectionKeys.redlock),
  redis: () =>
    container.resolve<[RedisClientType, RedisClientType, ...RedisClientType[]]>(
      kInjectionKeys.redis
    ),
  ioredis: () => container.resolve<[Redis, ...Redis[]]>(kInjectionKeys.ioredis),
  dset: () => container.resolve<IDSetContext>(kInjectionKeys.dset),
  usage: () => container.resolve<IUsageContext>(kInjectionKeys.usage),
};
import 'reflect-metadata';

import assert from 'assert';
import {Redis} from 'ioredis';
import {construct} from 'js-accessor';
import {isFunction} from 'lodash-es';
import {RedisClientType} from 'redis';
import {
  AnyFn,
  DisposableResource,
  DisposablesStore,
  LockStore,
  Logger,
  PromiseStore,
  getLogger,
} from 'softkave-js-utils';
import {container} from 'tsyringe';
import {getAgentTokenModel} from '../../db/agentToken.js';
import {getAppMongoModel, getAppShardMongoModel} from '../../db/app.js';
import {getAppRuntimeStateModel} from '../../db/appRuntimeState.js';
import {getAssignedItemModel} from '../../db/assignedItem.js';
import {getCollaborationRequestModel} from '../../db/collaborationRequest.js';
import {
  DbConnection,
  MongoDbConnection,
  NoopDbConnection,
  isMongoConnection,
} from '../../db/connection.js';
import {getEmailBlocklistModel, getEmailMessageModel} from '../../db/email.js';
import {getJobModel} from '../../db/job.js';
import {getJobHistoryMongoModel} from '../../db/jobHistory.js';
import {getPermissionGroupModel} from '../../db/permissionGroup.js';
import {getPermissionItemModel} from '../../db/permissionItem.js';
import {getWorkspaceModel} from '../../db/workspace.js';
import {kAppPresetShards, kAppType} from '../../definitions/app.js';
import {kFimidaraResourceType} from '../../definitions/system.js';
import {assertAgentToken} from '../../endpoints/agentTokens/utils.js';
import {FimidaraApp} from '../../endpoints/app/FimidaraApp.js';
import {assertCollaborationRequest} from '../../endpoints/collaborationRequests/utils.js';
import {FimidaraWorkerPool} from '../../endpoints/jobs/fimidaraWorker/FimidaraWorkerPool.js';
import {assertPermissionGroup} from '../../endpoints/permissionGroups/utils.js';
import {assertPermissionItem} from '../../endpoints/permissionItems/utils.js';
import {assertWorkspace} from '../../endpoints/workspaces/utils.js';
import {
  FimidaraRuntimeConfig,
  FimidaraSuppliedConfig,
  getSuppliedConfig,
  kFimidaraConfigDbType,
} from '../../resources/config.js';
import {appAssert, assertNotFound} from '../../utils/assertion.js';
import {getNewIdForResource} from '../../utils/resource.js';
import {ShardedRunner} from '../../utils/shardedRunnerQueue.js';
import SessionContext, {SessionContextType} from '../SessionContext.js';
import {
  AsyncLocalStorageUtils,
  kAsyncLocalStorageUtils,
} from '../asyncLocalStorage.js';
import {ICacheContext} from '../cache/types.js';
import {getCacheContext} from '../cache/utils.js';
import {MongoDataProviderUtils} from '../data/MongoDataProviderUtils.js';
import {
  AgentTokenMongoDataProvider,
  AppMongoDataProvider,
  AppRuntimeStateMongoDataProvider,
  AppShardMongoDataProvider,
  AssignedItemMongoDataProvider,
  CollaborationRequestMongoDataProvider,
  EmailBlocklistMongoDataProvider,
  EmailMessageMongoDataProvider,
  JobHistoryMongoDataProvider,
  JobMongoDataProvider,
  PermissionGroupMongoDataProvider,
  PermissionItemMongoDataProvider,
  WorkspaceMongoDataProvider,
} from '../data/models.js';
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
import {getDSetContext} from '../dset/utils.js';
import {IEmailProviderContext} from '../email/types.js';
import {getEmailProvider} from '../email/utils.js';
import {IPubSubContext} from '../pubsub/types.js';
import {getPubSubContext} from '../pubsub/utils.js';
import {IQueueContext} from '../queue/types.js';
import {getQueueContext} from '../queue/utils.js';
import {getIoRedis, getRedis} from '../redis.js';
import {IRedlockContext} from '../redlock/types.js';
import {getRedlockContext} from '../redlock/utils.js';
import {IServerRuntimeState} from '../runtime.js';
import {SecretsManagerProvider} from '../secrets/types.js';
import {getSecretsProvider} from '../secrets/utils.js';
import {DataSemanticAgentToken} from '../semantic/agentToken/model.js';
import {SemanticAgentTokenProvider} from '../semantic/agentToken/types.js';
import {SemanticAppShardProviderImpl} from '../semantic/app/SemanticAppShardProviderImpl.js';
import {SemanticAppShardProvider} from '../semantic/app/types.js';
import {DataSemanticAssignedItem} from '../semantic/assignedItem/model.js';
import {SemanticAssignedItemProvider} from '../semantic/assignedItem/types.js';
import {DataSemanticCollaborationRequest} from '../semantic/collaborationRequest/model.js';
import {SemanticCollaborationRequestProvider} from '../semantic/collaborationRequest/types.js';
import {SemanticEmailBlocklistProviderImpl} from '../semantic/email/SemanticEmailBlocklistImpl.js';
import {SemanticEmailMessageProviderImpl} from '../semantic/email/SemanticEmailMessageImpl.js';
import {
  SemanticEmailBlocklistProvider,
  SemanticEmailMessageProvider,
} from '../semantic/email/types.js';
import {DataSemanticJob} from '../semantic/job/model.js';
import {SemanticJobProvider} from '../semantic/job/types.js';
import {DataSemanticJobHistory} from '../semantic/jobHistory/model.js';
import {SemanticJobHistoryProvider} from '../semantic/jobHistory/types.js';
import {
  DataSemanticApp,
  DataSemanticPermissionGroup,
} from '../semantic/models.js';
import {DataSemanticPermission} from '../semantic/permission/model.js';
import {SemanticPermissionProviderType} from '../semantic/permission/types.js';
import {DataSemanticPermissionItem} from '../semantic/permissionItem/model.js';
import {SemanticPermissionItemProviderType} from '../semantic/permissionItem/types.js';
import {
  SemanticAppProvider,
  SemanticPermissionGroupProviderType,
  SemanticProviderUtils,
} from '../semantic/types.js';
import {DataSemanticProviderUtils} from '../semantic/utils.js';
import {DataSemanticWorkspace} from '../semantic/workspace/model.js';
import {SemanticWorkspaceProviderType} from '../semantic/workspace/types.js';
import {UsageProvider} from '../usage/UsageProvider.js';
import {IUsageContext} from '../usage/types.js';
import {kDataModels, kUtilsInjectables} from './injectables.js';
import {kInjectionKeys} from './keys.js';

function registerToken(
  token: string,
  item: unknown,
  use: 'value' | 'factory' = 'value'
) {
  if (use === 'factory') {
    assert(isFunction(item));
    container.register(token, {useFactory: item as AnyFn});
  } else {
    if (isFunction((item as DisposableResource | undefined)?.dispose)) {
      kUtilsInjectables.disposables().add(item as DisposableResource);
    }

    container.register(token, {useValue: item});
  }
}

export const kRegisterSemanticModels = {
  agentToken: (item: SemanticAgentTokenProvider) =>
    registerToken(kInjectionKeys.semantic.agentToken, item),
  workspace: (item: SemanticWorkspaceProviderType) =>
    registerToken(kInjectionKeys.semantic.workspace, item),
  collaborationRequest: (item: SemanticCollaborationRequestProvider) =>
    registerToken(kInjectionKeys.semantic.collaborationRequest, item),
  permissions: (item: SemanticPermissionProviderType) =>
    registerToken(kInjectionKeys.semantic.permissions, item),
  permissionGroup: (item: SemanticPermissionGroupProviderType) =>
    registerToken(kInjectionKeys.semantic.permissionGroup, item),
  permissionItem: (item: SemanticPermissionItemProviderType) =>
    registerToken(kInjectionKeys.semantic.permissionItem, item),
  assignedItem: (item: SemanticAssignedItemProvider) =>
    registerToken(kInjectionKeys.semantic.assignedItem, item),
  job: (item: SemanticJobProvider | AnyFn<[], SemanticJobProvider>) =>
    registerToken(kInjectionKeys.semantic.job, item),
  app: (item: SemanticAppProvider) =>
    registerToken(kInjectionKeys.semantic.app, item),
  emailMessage: (item: SemanticEmailMessageProvider) =>
    registerToken(kInjectionKeys.semantic.emailMessage, item),
  emailBlocklist: (item: SemanticEmailBlocklistProvider) =>
    registerToken(kInjectionKeys.semantic.emailBlocklist, item),
  appShard: (item: SemanticAppShardProvider) =>
    registerToken(kInjectionKeys.semantic.appShard, item),
  jobHistory: (item: SemanticJobHistoryProvider) =>
    registerToken(kInjectionKeys.semantic.jobHistory, item),
  utils: (item: SemanticProviderUtils) =>
    registerToken(kInjectionKeys.semantic.utils, item),
};

export const kRegisterDataModels = {
  agentToken: (item: AgentTokenDataProvider) =>
    registerToken(kInjectionKeys.data.agentToken, item),
  workspace: (item: WorkspaceDataProvider) =>
    registerToken(kInjectionKeys.data.workspace, item),
  permissionGroup: (item: PermissionGroupDataProvider) =>
    registerToken(kInjectionKeys.data.permissionGroup, item),
  permissionItem: (item: PermissionItemDataProvider) =>
    registerToken(kInjectionKeys.data.permissionItem, item),
  assignedItem: (item: AssignedItemDataProvider) =>
    registerToken(kInjectionKeys.data.assignedItem, item),
  collaborationRequest: (item: CollaborationRequestDataProvider) =>
    registerToken(kInjectionKeys.data.collaborationRequest, item),
  job: (item: JobDataProvider) => registerToken(kInjectionKeys.data.job, item),
  appRuntimeState: (item: AppRuntimeStateDataProvider) =>
    registerToken(kInjectionKeys.data.appRuntimeState, item),
  app: (item: AppDataProvider) => registerToken(kInjectionKeys.data.app, item),
  emailMessage: (item: EmailMessageDataProvider) =>
    registerToken(kInjectionKeys.data.emailMessage, item),
  emailBlocklist: (item: EmailBlocklistDataProvider) =>
    registerToken(kInjectionKeys.data.emailBlocklist, item),
  appShard: (item: AppShardDataProvider) =>
    registerToken(kInjectionKeys.data.appShard, item),
  jobHistory: (item: JobHistoryDataProvider) =>
    registerToken(kInjectionKeys.data.jobHistory, item),
  utils: (item: DataProviderUtils) =>
    registerToken(kInjectionKeys.data.utils, item),
};

export const kRegisterUtilsInjectables = {
  suppliedConfig: (item: FimidaraSuppliedConfig) =>
    registerToken(kInjectionKeys.suppliedConfig, item),
  runtimeConfig: (item: FimidaraRuntimeConfig) =>
    registerToken(kInjectionKeys.runtimeConfig, item),
  runtimeState: (item: IServerRuntimeState) =>
    registerToken(kInjectionKeys.runtimeState, item),
  secretsManager: (item: SecretsManagerProvider) =>
    registerToken(kInjectionKeys.secretsManager, item),
  asyncLocalStorage: (item: AsyncLocalStorageUtils) =>
    registerToken(kInjectionKeys.asyncLocalStorage, item),
  session: (item: SessionContextType) =>
    registerToken(kInjectionKeys.session, item),
  dbConnection: (item: DbConnection) =>
    registerToken(kInjectionKeys.dbConnection, item),
  email: (item: IEmailProviderContext) =>
    registerToken(kInjectionKeys.email, item),
  promises: (item: PromiseStore) =>
    registerToken(kInjectionKeys.promises, item),
  locks: (item: LockStore) => registerToken(kInjectionKeys.locks, item),
  disposables: (item: DisposablesStore) =>
    registerToken(kInjectionKeys.disposables, item),
  logger: (item: Logger) => registerToken(kInjectionKeys.logger, item),
  shardedRunner: (item: ShardedRunner) =>
    registerToken(kInjectionKeys.shardedRunner, item),
  serverApp: (item: FimidaraApp) =>
    registerToken(kInjectionKeys.serverApp, item),
  workerPool: (item: FimidaraWorkerPool) =>
    registerToken(kInjectionKeys.workerPool, item),
  queue: (item: IQueueContext) => registerToken(kInjectionKeys.queue, item),
  pubsub: (item: IPubSubContext) => registerToken(kInjectionKeys.pubsub, item),
  cache: (item: ICacheContext) => registerToken(kInjectionKeys.cache, item),
  redlock: (item: IRedlockContext) =>
    registerToken(kInjectionKeys.redlock, item),
  redis: (item: [RedisClientType, RedisClientType, ...RedisClientType[]]) =>
    registerToken(kInjectionKeys.redis, item),
  ioredis: (item: [Redis, ...Redis[]]) =>
    registerToken(kInjectionKeys.ioredis, item),
  dset: (item: IDSetContext) => registerToken(kInjectionKeys.dset, item),
  usage: (item: IUsageContext) => registerToken(kInjectionKeys.usage, item),
};

export function registerDataModelInjectables() {
  const connection = kUtilsInjectables.dbConnection().get();
  appAssert(isMongoConnection(connection));

  kRegisterDataModels.agentToken(
    new AgentTokenMongoDataProvider(getAgentTokenModel(connection))
  );
  kRegisterDataModels.workspace(
    new WorkspaceMongoDataProvider(getWorkspaceModel(connection))
  );
  kRegisterDataModels.permissionGroup(
    new PermissionGroupMongoDataProvider(getPermissionGroupModel(connection))
  );
  kRegisterDataModels.permissionItem(
    new PermissionItemMongoDataProvider(getPermissionItemModel(connection))
  );
  kRegisterDataModels.assignedItem(
    new AssignedItemMongoDataProvider(getAssignedItemModel(connection))
  );
  kRegisterDataModels.job(new JobMongoDataProvider(getJobModel(connection)));
  kRegisterDataModels.appRuntimeState(
    new AppRuntimeStateMongoDataProvider(getAppRuntimeStateModel(connection))
  );
  kRegisterDataModels.collaborationRequest(
    new CollaborationRequestMongoDataProvider(
      getCollaborationRequestModel(connection)
    )
  );
  kRegisterDataModels.app(
    new AppMongoDataProvider(getAppMongoModel(connection))
  );
  kRegisterDataModels.emailMessage(
    new EmailMessageMongoDataProvider(getEmailMessageModel(connection))
  );
  kRegisterDataModels.emailBlocklist(
    new EmailBlocklistMongoDataProvider(getEmailBlocklistModel(connection))
  );
  kRegisterDataModels.appShard(
    new AppShardMongoDataProvider(getAppShardMongoModel(connection))
  );
  kRegisterDataModels.jobHistory(
    new JobHistoryMongoDataProvider(getJobHistoryMongoModel(connection))
  );
  kRegisterDataModels.utils(new MongoDataProviderUtils());
}

export function registerSemanticModelInjectables() {
  kRegisterSemanticModels.agentToken(
    new DataSemanticAgentToken(kDataModels.agentToken(), assertAgentToken)
  );
  kRegisterSemanticModels.workspace(
    new DataSemanticWorkspace(kDataModels.workspace(), assertWorkspace)
  );
  kRegisterSemanticModels.collaborationRequest(
    new DataSemanticCollaborationRequest(
      kDataModels.collaborationRequest(),
      assertCollaborationRequest
    )
  );
  kRegisterSemanticModels.permissions(new DataSemanticPermission());
  kRegisterSemanticModels.permissionGroup(
    new DataSemanticPermissionGroup(
      kDataModels.permissionGroup(),
      assertPermissionGroup
    )
  );
  kRegisterSemanticModels.permissionItem(
    new DataSemanticPermissionItem(
      kDataModels.permissionItem(),
      assertPermissionItem
    )
  );
  kRegisterSemanticModels.assignedItem(
    new DataSemanticAssignedItem(kDataModels.assignedItem(), assertNotFound)
  );
  kRegisterSemanticModels.job(
    new DataSemanticJob(kDataModels.job(), assertNotFound)
  );
  kRegisterSemanticModels.app(
    new DataSemanticApp(kDataModels.app(), assertNotFound)
  );
  kRegisterSemanticModels.emailMessage(
    new SemanticEmailMessageProviderImpl(
      kDataModels.emailMessage(),
      assertNotFound
    )
  );
  kRegisterSemanticModels.emailBlocklist(
    new SemanticEmailBlocklistProviderImpl(
      kDataModels.emailBlocklist(),
      assertNotFound
    )
  );
  kRegisterSemanticModels.appShard(
    new SemanticAppShardProviderImpl(kDataModels.appShard(), assertNotFound)
  );
  kRegisterSemanticModels.jobHistory(
    new DataSemanticJobHistory(kDataModels.jobHistory(), assertNotFound)
  );
  kRegisterSemanticModels.utils(new DataSemanticProviderUtils());
}

export async function registerUtilsInjectables(
  overrideConfig: FimidaraSuppliedConfig = {}
) {
  const suppliedConfig = {...getSuppliedConfig(), ...overrideConfig};
  const promiseStore = new PromiseStore();

  kRegisterUtilsInjectables.runtimeState(construct<IServerRuntimeState>());
  kRegisterUtilsInjectables.suppliedConfig(suppliedConfig);
  kRegisterUtilsInjectables.promises(promiseStore);
  kRegisterUtilsInjectables.disposables(new DisposablesStore(promiseStore));
  kRegisterUtilsInjectables.asyncLocalStorage(kAsyncLocalStorageUtils);
  kRegisterUtilsInjectables.locks(new LockStore());
  kRegisterUtilsInjectables.session(new SessionContext());
  kRegisterUtilsInjectables.logger(getLogger(suppliedConfig.loggerType));

  const shardedRunner = new ShardedRunner();
  kRegisterUtilsInjectables.shardedRunner(shardedRunner);

  if (suppliedConfig.useFimidaraApp) {
    const serverApp = new FimidaraApp({
      appId: getNewIdForResource(kFimidaraResourceType.App),
      shard: kAppPresetShards.fimidaraMain,
      type: kAppType.server,
    });
    kRegisterUtilsInjectables.serverApp(serverApp);

    if (suppliedConfig.useFimidaraWorkerPool) {
      kRegisterUtilsInjectables.workerPool(
        new FimidaraWorkerPool({
          server: serverApp,
          workerCount: suppliedConfig.runnerCount,
        })
      );
    }
  }

  if (
    !suppliedConfig.dbType ||
    suppliedConfig.dbType === kFimidaraConfigDbType.mongoDb
  ) {
    assert(suppliedConfig.mongoDbURI);
    assert(suppliedConfig.mongoDbDatabaseName);
    kRegisterUtilsInjectables.dbConnection(
      new MongoDbConnection(
        suppliedConfig.mongoDbURI,
        suppliedConfig.mongoDbDatabaseName
      )
    );
  } else {
    kRegisterUtilsInjectables.dbConnection(new NoopDbConnection());
  }

  const {redisURL} = kUtilsInjectables.suppliedConfig();
  if (redisURL) {
    const redis = await getRedis();
    const ioRedis = await getIoRedis();
    const redis2 = await getRedis();
    kRegisterUtilsInjectables.redis([redis, redis2]);
    kRegisterUtilsInjectables.ioredis([ioRedis]);
  }

  kRegisterUtilsInjectables.email(getEmailProvider(suppliedConfig));
  kRegisterUtilsInjectables.secretsManager(getSecretsProvider(suppliedConfig));
  kRegisterUtilsInjectables.queue(await getQueueContext(suppliedConfig));
  kRegisterUtilsInjectables.pubsub(await getPubSubContext(suppliedConfig));
  kRegisterUtilsInjectables.cache(await getCacheContext(suppliedConfig));
  kRegisterUtilsInjectables.redlock(await getRedlockContext(suppliedConfig));
  kRegisterUtilsInjectables.dset(await getDSetContext(suppliedConfig));
  kRegisterUtilsInjectables.usage(new UsageProvider());
}

export async function registerInjectables(
  overrideConfig: FimidaraSuppliedConfig = {}
) {
  await registerUtilsInjectables(overrideConfig);
  registerDataModelInjectables();
  registerSemanticModelInjectables();
}

export function clearInjectables() {
  container.reset();
}
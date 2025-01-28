function dataKey(name: string) {
  return `data_${name}`;
}

function semanticKey(name: string) {
  return `semantic_${name}`;
}

function logicKey(name: string) {
  return `logic_${name}`;
}

export const kInjectionKeys = {
  logic: {
    permissions: logicKey('permissions'),
    jobs: logicKey('jobs'),
  },
  data: {
    agentToken: dataKey('agentToken'),
    workspace: dataKey('workspace'),
    permissions: dataKey('permissions'),
    permissionGroup: dataKey('permissionGroup'),
    permissionItem: dataKey('permissionItem'),
    assignedItem: dataKey('assignedItem'),
    job: dataKey('job'),
    appRuntimeState: dataKey('appRuntimeState'),
    collaborationRequest: dataKey('collaborationRequest'),
    app: dataKey('app'),
    emailMessage: dataKey('emailMessage'),
    emailBlocklist: dataKey('emailBlocklist'),
    appShard: dataKey('appShard'),
    jobHistory: dataKey('jobHistory'),
    collaborator: dataKey('collaborator'),
    space: dataKey('space'),
    utils: dataKey('utils'),
  },
  semantic: {
    agentToken: semanticKey('agentToken'),
    workspace: semanticKey('workspace'),
    permissions: semanticKey('permissions'),
    permissionGroup: semanticKey('permissionGroup'),
    permissionItem: semanticKey('permissionItem'),
    assignedItem: semanticKey('assignedItem'),
    job: semanticKey('job'),
    collaborationRequest: semanticKey('collaborationRequest'),
    app: semanticKey('app'),
    emailMessage: semanticKey('emailMessage'),
    emailBlocklist: semanticKey('emailBlocklist'),
    appShard: semanticKey('appShard'),
    jobHistory: semanticKey('jobHistory'),
    collaborator: semanticKey('collaborator'),
    space: semanticKey('space'),
    utils: semanticKey('utils'),
  },
  encryption: 'encryption',
  // config: 'config',
  suppliedConfig: 'suppliedConfig',
  runtimeConfig: 'runtimeConfig',
  runtimeState: 'runtimeState',
  secretsManager: 'secretsManager',
  asyncLocalStorage: 'asyncLocalStorage',
  session: 'session',
  dbConnection: 'dbConnection',
  email: 'email',
  promises: 'promises',
  locks: 'locks',
  disposables: 'disposables',
  usageLogic: 'usageLogic',
  logger: 'logger',
  shardedRunner: 'shardedRunner',
  serverApp: 'serverApp',
  workerPool: 'workerPool',
  queue: 'queue',
  pubsub: 'pubsub',
  cache: 'cache',
  redlock: 'redlock',
  redis: 'redis',
  ioredis: 'ioredis',
  dset: 'dset',
  usage: 'usage',
};

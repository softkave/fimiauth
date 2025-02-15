import config from 'config';
import {ValueOf} from 'type-fest';
import {LoggerType} from '../contexts/logger/types.js';

/** Added after the app initialization phase. */
export interface FimidaraRuntimeConfig {
  appWorkspaceId: string;
}

export const kFimidaraConfigEmailProvider = {
  ses: 'ses',
  noop: 'noop',
} as const;

export type FimidaraConfigEmailProvider = ValueOf<
  typeof kFimidaraConfigEmailProvider
>;

export const kFimidaraConfigSecretsManagerProvider = {
  awsSecretsManager: 'awsSecretsManager',
  memory: 'mem',
} as const;

export type FimidaraConfigSecretsManagerProvider = ValueOf<
  typeof kFimidaraConfigSecretsManagerProvider
>;

export const kFimidaraConfigDbType = {
  mongoDb: 'mongoDb',
  noop: 'noop',
} as const;

export type FimidaraConfigDbType = ValueOf<typeof kFimidaraConfigDbType>;

export const kFimidaraConfigQueueProvider = {
  redis: 'redis',
  memory: 'mem',
} as const;

export type FimidaraConfigQueueProvider = ValueOf<
  typeof kFimidaraConfigQueueProvider
>;

export interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export type FimidaraSuppliedConfig = Partial<{
  // DB
  dbType: FimidaraConfigDbType;
  mongoDbURI: string;
  mongoDbDatabaseName: string;

  // Session
  jwtSecret: string;

  // Transport
  exposeHttpServer: boolean;
  httpPort: string;
  exposeHttpsServer: boolean;
  httpsPort: string;
  httpsPublicKeyFilepath: string;
  httpsPrivateKeyFilepath: string;

  // Management
  rootUserEmail: string;
  rootUserPassword: string;
  rootUserFirstName: string;
  rootUserLastName: string;

  // Email
  emailProvider: FimidaraConfigEmailProvider;
  senderEmailAddress: string;

  // Secrets
  secretsManagerProvider: FimidaraConfigSecretsManagerProvider;

  // Flags
  /** Users on waitlist cannot create workspaces but can be added to an existing
   * workspace. */
  FLAG_waitlistNewSignups: boolean;
  /** Where to persist files when `fileBackend` is
   * {@link kFimidaraConfigFilePersistenceProvider.fs} */

  // Runtime, may rename later
  appName: string;
  dateFormat: string;
  useFimidaraApp: boolean;
  useFimidaraWorkerPool: boolean;

  // URLs
  clientDomain: string;
  clientLoginLink: string;
  clientSignupLink: string;
  changePasswordLink: string;
  verifyEmailLink: string;
  upgradeWaitlistLink: string;

  // Logs
  loggerType: LoggerType;

  // Worker
  runnerLocation: string;
  runnerCount: number;

  // Jobs
  // newSignupsOnWaitlistJobIntervalMs: number;

  // AWS configs
  awsConfigs?: Partial<{
    all: AWSConfig;
    s3: AWSConfig;
    ses: AWSConfig;
    secretsManager: AWSConfig;
    s3Bucket: string;
    sesEmailEncoding: string;
  }>;

  // Redis
  redisURL: string;
  redisDatabase: number;

  // Queues
  queueProvider: FimidaraConfigQueueProvider;

  // PubSub
  pubSubProvider: FimidaraConfigQueueProvider;

  // Cache
  cacheProvider: FimidaraConfigQueueProvider;

  // Redlock
  redlockProvider: FimidaraConfigQueueProvider;

  // Distributed Set
  dsetProvider: FimidaraConfigQueueProvider;

  systemAuthId: string;
}>;

export type FimidaraConfig = FimidaraSuppliedConfig & FimidaraRuntimeConfig;

export function getSuppliedConfig(): FimidaraSuppliedConfig {
  const suppliedConfig = config.util.toObject();
  return suppliedConfig;
}

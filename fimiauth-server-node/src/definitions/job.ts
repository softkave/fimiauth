import {AnyFn, AnyObject, OmitFrom, PartialRecord} from 'softkave-js-utils';
import {ValueOf} from 'type-fest';
import {NewSignupsOnWaitlistEmailProps} from '../emailTemplates/newSignupsOnWaitlist.js';
import {BaseEmailTemplateProps} from '../emailTemplates/types.js';
import {FimidaraConfigEmailProvider} from '../resources/config.js';
import {AppShardId} from './app.js';
import {Agent, FimidaraResourceType, Resource} from './system.js';

export const kJobType = {
  deleteResource: 'deleteResource',
  /** TODO: separated from deleteResource because it's a bit more complex and
   * there's a job created for each input item */
  deletePermissionItem: 'deletePermissionItem',
  email: 'email',
  /** Primarily used for testing. A job that does nothing. */
  noop: 'noop',
  /** Primarily used for testing. A job that will always fail! */
  fail: 'fail',
} as const;

export const kJobStatus = {
  pending: 'pending',
  inProgress: 'inProgress',
  waitingForChildren: 'waitingForChildren',
  completed: 'completed',
  failed: 'failed',
} as const;

export const kJobPresetPriority = {
  p1: 1,
  p2: 2,
  p3: 3,
  p4: 4,
  p5: 5,
};

export const kJobRunCategory = {
  once: 'once',
  cron: 'cron',
};

export type JobType = ValueOf<typeof kJobType>;
export type JobStatus = ValueOf<typeof kJobStatus>;
export type JobRunCategory = ValueOf<typeof kJobRunCategory>;

export interface JobStatusHistory {
  status: JobStatus;
  statusLastUpdatedAt: number;
  runnerId?: string;
}

export interface RunAfterJobItem {
  jobId: string;
  status: JobStatus[];
}

export interface Job<
  TParams extends AnyObject = AnyObject,
  TMeta extends AnyObject = AnyObject,
> extends Resource {
  createdBy: Agent;
  type: JobType;
  params: TParams;
  meta?: TMeta;
  workspaceId?: string;
  spaceId?: string;
  status: JobStatus;
  statusLastUpdatedAt: number;
  minRunnerVersion: number;
  runnerId?: string;
  parentJobId?: string;
  // TODO: consider a bit packing or bloom filter-related alternative, that
  // allows for false-positives but no false-negatives
  parents: string[];
  idempotencyToken: string;
  /** Higher number carries more weight. */
  priority: number;
  /** For selectively picking jobs so runners don't run jobs that do not apply
   * to them, for example during testing. */
  shard: AppShardId;
  runAfter?: RunAfterJobItem[];
  /** Milliseconds timestamp to mark jobs already visited. Useful when the job
   * is not ready, and to prevent previous evaluator & other runners from
   * fetching until after a cooldown. */
  cooldownTill?: number;
  runCategory?: JobRunCategory;
  /** Run interval in milliseconds. */
  cronInterval?: number;
}

export type DeleteResourceCascadeFnDefaultArgs = {
  workspaceId: string;
  resourceId: string;
};

export type DeleteResourceJobParams = DeleteResourceCascadeFnDefaultArgs & {
  type: FimidaraResourceType;
};

export type DeleteFilePartJobParams = DeleteResourceCascadeFnDefaultArgs & {
  clientMultipartId: string;
  part: number;
  internalMultipartId: string;
  internalPartId: string;
};

export interface DeleteResourceJobMeta {
  getArtifacts?: PartialRecord<string, {page: number; pageSize: number}>;
  deleteArtifacts?: PartialRecord<string, {done: boolean}>;
  preRunMeta?: AnyObject;
}

export interface INewSignupsOnWaitlistJobMeta {
  lastRunMs?: number;
}

export const kEmailJobType = {
  collaborationRequest: 'collaborationRequest',
  collaborationRequestExpired: 'collaborationRequestExpired',
  collaborationRequestResponse: 'collaborationRequestResponse',
  collaborationRequestRevoked: 'collaborationRequestRevoked',
  upgradedFromWaitlist: 'upgradedFromWaitlist',
  newSignupsOnWaitlist: 'newSignupsOnWaitlist',
  // usageExceeded: 'usageExceeded',
} as const;

export type EmailJobType = ValueOf<typeof kEmailJobType>;

export interface CollaborationRequestEmailJobParams {
  requestId: string;
}

export type EmailJobParams = {
  emailAddress: string[];
  userId: string[];
} & (
  | {
      type: typeof kEmailJobType.collaborationRequest;
      params: CollaborationRequestEmailJobParams;
    }
  | {
      type: typeof kEmailJobType.collaborationRequestExpired;
      params: CollaborationRequestEmailJobParams;
    }
  | {
      type: typeof kEmailJobType.collaborationRequestResponse;
      params: CollaborationRequestEmailJobParams;
    }
  | {
      type: typeof kEmailJobType.collaborationRequestRevoked;
      params: CollaborationRequestEmailJobParams;
    }
  | {type: typeof kEmailJobType.upgradedFromWaitlist}
  | {
      type: typeof kEmailJobType.newSignupsOnWaitlist;
      params: OmitFrom<
        NewSignupsOnWaitlistEmailProps,
        keyof BaseEmailTemplateProps | 'upgradeWaitlistURL'
      >;
    }
);
// | {
//     type: typeof kEmailJobType.usageExceeded;
//     params: UsageExceededEmailProps;
//   }

export interface EmailJobMeta {
  emailProvider: FimidaraConfigEmailProvider;
  other?: AnyObject;
}

export const kJobRunnerV1 = 1;

export const kJobIdempotencyTokens: Record<
  JobType,
  AnyFn<string[], string>
> = Object.keys(kJobType).reduce(
  (acc, type) => {
    acc[type as JobType] = (...args: string[]) => `${type}_${args.join('_')}`;
    return acc;
  },
  {} as Record<JobType, AnyFn<string[], string>>
);

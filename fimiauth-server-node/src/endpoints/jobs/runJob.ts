import {kUtilsInjectables} from '../../contexts/injection/injectables.js';
import {Job, JobType, kJobStatus, kJobType} from '../../definitions/job.js';
import {noopAsync} from '../../utils/fns.js';
import {AnyFn} from '../../utils/types.js';
import {completeJob} from './completeJob.js';
import {runDeletePermissionItemsJob} from './runners/runDeletePermissionItemsJob.js';
import {runDeleteResourceJob} from './runners/runDeleteResourceJob/runDeleteResourceJob.js';
import {runEmailJob} from './runners/runEmailJob/runEmailJob.js';
import {runNewSignupsOnWaitlistJob} from './runners/runNewSignupsOnWaitlistJob.js';

const kJobTypeToHandlerMap: Record<JobType, AnyFn<[Job], Promise<void>>> = {
  [kJobType.deleteResource]: runDeleteResourceJob,
  [kJobType.deletePermissionItem]: runDeletePermissionItemsJob,
  [kJobType.newSignupsOnWaitlist]: runNewSignupsOnWaitlistJob,
  [kJobType.email]: runEmailJob,
  [kJobType.noop]: noopAsync,
  [kJobType.fail]: async () => {
    throw new Error('Fail job');
  },
};

export async function runJob(job: Job) {
  try {
    const handler = kJobTypeToHandlerMap[job.type];
    await handler(job);
    return await completeJob(job.resourceId);
  } catch (error: unknown) {
    kUtilsInjectables.logger().log(`Job ${job.resourceId} failed with error`);
    kUtilsInjectables.logger().error(error);
    return await completeJob(job.resourceId, kJobStatus.failed);
  }
}

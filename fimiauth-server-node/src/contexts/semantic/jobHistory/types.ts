import {JobStatus} from '../../../definitions/job.js';
import {JobHistory} from '../../../definitions/jobHistory.js';
import {
  SemanticBaseProviderType,
  SemanticProviderMutationParams,
  SemanticProviderQueryParams,
} from '../types.js';

export type SemanticJobHistoryProvider =
  SemanticBaseProviderType<JobHistory> & {
    /** Fetch most recent job history item with status or any last item */
    getJobLastHistoryItem(
      jobId: string,
      status: JobStatus | undefined,
      opts?: SemanticProviderQueryParams<JobHistory>
    ): Promise<JobHistory | null>;
    deleteManyBySpaceId(
      params: {spaceId: string},
      opts: SemanticProviderMutationParams
    ): Promise<void>;
  };

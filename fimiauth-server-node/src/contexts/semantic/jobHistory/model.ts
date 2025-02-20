import {first} from 'lodash-es';
import {JobStatus} from '../../../definitions/job.js';
import {JobHistory} from '../../../definitions/jobHistory.js';
import {DataQuery} from '../../data/types.js';
import {addIsDeletedIntoQuery} from '../SemanticBaseProvider.js';
import {SemanticWorkspaceResourceProvider} from '../SemanticWorkspaceResourceProvider.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderQueryParams,
} from '../types.js';
import {SemanticJobHistoryProvider} from './types.js';

export class SemanticJobHistory
  extends SemanticWorkspaceResourceProvider<JobHistory>
  implements SemanticJobHistoryProvider
{
  async getJobLastHistoryItem(
    jobId: string,
    status: JobStatus | undefined,
    opts?: SemanticProviderQueryParams<JobHistory> | undefined
  ): Promise<JobHistory | null> {
    const query = addIsDeletedIntoQuery<DataQuery<JobHistory>>(
      {jobId, status},
      opts?.includeDeleted || false
    );
    const jobHistoryList = await this.data.getManyByQuery(query, {
      ...opts,
      pageSize: 1,
      sort: {createdAt: 'desc'},
    });

    return first(jobHistoryList) || null;
  }

  async deleteManyBySpaceId(
    params: {spaceId: string},
    opts: SemanticProviderMutationParams
  ): Promise<void> {
    const query = addIsDeletedIntoQuery<DataQuery<JobHistory>>(
      {spaceId: params.spaceId},
      opts?.includeDeleted || true
    );

    await this.data.deleteManyByQuery(query as DataQuery<JobHistory>, opts);
  }
}

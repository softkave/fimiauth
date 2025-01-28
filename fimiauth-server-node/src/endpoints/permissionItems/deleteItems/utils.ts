import {kJobType} from '../../../definitions/job.js';
import {Agent} from '../../../definitions/system.js';
import {queueJobs} from '../../jobs/queueJobs.js';
import {DeletePermissionItemInput} from './types.js';

export async function beginDeletePermissionItemByInput(props: {
  workspaceId: string;
  spaceId: string;
  items: DeletePermissionItemInput[];
  agent: Agent;
  parentJobId?: string;
}) {
  const {workspaceId, spaceId, items, agent, parentJobId} = props;
  return queueJobs<DeletePermissionItemInput>({
    workspaceId,
    parentJobId,
    spaceId,
    jobsInput: items.map(item => {
      return {
        type: kJobType.deletePermissionItem,
        params: item,
        createdBy: agent,
        idempotencyToken: Date.now().toString(),
      };
    }),
  });
}

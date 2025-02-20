import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {DeleteResourceJobParams, kJobType} from '../../../definitions/job.js';
import {
  Agent,
  Resource,
  kFimidaraResourceType,
} from '../../../definitions/system.js';
import {extractResourceIdList} from '../../../utils/fns.js';
import {queueJobs} from '../../jobs/queueJobs.js';

export async function beginDeleteCollaborator(props: {
  workspaceId: string;
  spaceId: string;
  resources: Resource[];
  agent: Agent;
  parentJobId?: string;
}) {
  const {workspaceId, spaceId, resources, agent, parentJobId} = props;
  const jobs = await kSemanticModels.utils().withTxn(async opts => {
    const [, jobs] = await Promise.all([
      kSemanticModels
        .collaborator()
        .softDeleteManyByIdList(extractResourceIdList(resources), agent, opts),
      queueJobs<DeleteResourceJobParams>({
        workspaceId,
        parentJobId,
        spaceId,
        jobsInput: resources.map(resource => {
          return {
            createdBy: agent,
            type: kJobType.deleteResource,
            idempotencyToken: Date.now().toString(),
            params: {
              workspaceId,
              spaceId,
              resourceId: resource.resourceId,
              type: kFimidaraResourceType.Collaborator,
            },
          };
        }),
      }),
    ]);

    return jobs;
  });

  return jobs;
}

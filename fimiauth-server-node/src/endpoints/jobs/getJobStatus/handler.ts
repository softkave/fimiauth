import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {appAssert} from '../../../utils/assertion.js';
import {kReuseableErrors} from '../../../utils/reusableErrors.js';
import {validate} from '../../../utils/validate.js';
import {GetJobStatusEndpoint} from './types.js';
import {getJobStatusJoiSchema} from './validation.js';

const getJobStatus: GetJobStatusEndpoint = async reqData => {
  const data = validate(reqData.data, getJobStatusJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const job = await kSemanticModels.job().getOneById(data.jobId);
  appAssert(job, kReuseableErrors.job.notFound());
  appAssert(
    job.workspaceId,
    kReuseableErrors.job.notFound(),
    'Attempt to retrieve an internal job'
  );

  appAssert(
    agent.agentToken.spaceId === job.spaceId,
    kReuseableErrors.job.notFound()
  );

  return {status: job.status};
};

export default getJobStatus;

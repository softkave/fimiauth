import {afterAll, beforeAll, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {
  DeleteResourceJobParams,
  Job,
  kJobType,
} from '../../../definitions/job.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {appAssert} from '../../../utils/assertion.js';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertSpaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import deleteSpace from './handler.js';
import {DeleteSpaceEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('space permission group deleted', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const {space} = await insertSpaceForTest({
    agentToken,
    workspaceId: workspace.resourceId,
  });
  const reqData = RequestData.fromExpressRequest<DeleteSpaceEndpointParams>(
    mockExpressRequestWithAgentToken(agentToken),
    {spaceId: space.resourceId}
  );
  const result = await deleteSpace(reqData);
  assertEndpointResultOk(result);

  appAssert(result.jobId);
  const job = (await kSemanticModels.job().getOneByQuery({
    type: kJobType.deleteResource,
    resourceId: result.jobId,
    params: {
      $objMatch: {type: kFimidaraResourceType.Space},
    },
  })) as Job<DeleteResourceJobParams>;
  expect(job).toBeTruthy();
  expect(job?.params).toMatchObject({
    resourceId: space.resourceId,
    workspaceId: workspace.resourceId,
  });

  const dbItem = await kSemanticModels
    .space()
    .getOneByQuery({resourceId: space.resourceId, isDeleted: true});
  expect(dbItem).toBeTruthy();
});

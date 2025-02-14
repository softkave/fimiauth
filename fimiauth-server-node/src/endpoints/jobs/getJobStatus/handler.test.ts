import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import RequestData from '../../RequestData.js';
import {generateAndInsertJobListForTest} from '../../testUtils/generate/job.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getJobStatus from './handler.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getJobStatus', () => {
  test('getJobStatus', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [job] = await generateAndInsertJobListForTest(/** count */ 1, {
      workspaceId: workspace.resourceId,
    });

    const result = await getJobStatus(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(agentToken),
        {
          jobId: job.resourceId,
        }
      )
    );
    assertEndpointResultOk(result);
    expect(result.status).toBe(job.status);
  });
});

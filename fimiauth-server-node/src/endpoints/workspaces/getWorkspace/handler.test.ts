import {afterAll, beforeAll, expect, test} from 'vitest';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getWorkspace from './handler.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('workspace returned', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const result = await getWorkspace(
    RequestData.fromExpressRequest(
      mockExpressRequestWithAgentToken(agentToken),
      {
        workspaceId: workspace.resourceId,
      }
    )
  );
  assertEndpointResultOk(result);
  expect(result.workspace).toMatchObject(workspace);
});

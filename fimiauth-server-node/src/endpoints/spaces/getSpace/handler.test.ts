import {afterAll, beforeAll, expect, test} from 'vitest';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertSpaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getSpace from './handler.js';
import {GetSpaceEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('referenced space returned', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const {space} = await insertSpaceForTest({
    agentToken,
    workspaceId: workspace.resourceId,
  });

  const reqData = RequestData.fromExpressRequest<GetSpaceEndpointParams>(
    mockExpressRequestWithAgentToken(agentToken),
    {spaceId: space.resourceId}
  );
  const result = await getSpace(reqData);
  assertEndpointResultOk(result);
  expect(result.space).toMatchObject(space);
});

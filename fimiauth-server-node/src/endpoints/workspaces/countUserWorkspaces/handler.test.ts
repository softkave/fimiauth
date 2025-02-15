import {kLoopAsyncSettlementType, loopAndCollateAsync} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {appAssert} from '../../../utils/assertion.js';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertWorkspaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import countUserWorkspaces from './handler.js';
beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('countUserWorkspaces', () => {
  test('count', async () => {
    const {agentToken} = await generateWorkspaceAndSessionAgent();
    const userId = agentToken.forEntityId;
    appAssert(userId);
    await loopAndCollateAsync(
      () => insertWorkspaceForTest({userId}),
      14,
      kLoopAsyncSettlementType.all
    );

    const count = 15;

    const reqData = RequestData.fromExpressRequest(
      mockExpressRequestWithAgentToken(agentToken),
      {userId}
    );
    const result = await countUserWorkspaces(reqData);
    assertEndpointResultOk(result);

    expect(result.count).toBe(count);
  });
});

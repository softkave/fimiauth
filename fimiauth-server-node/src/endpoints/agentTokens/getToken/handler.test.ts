import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertAgentTokenForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getAgentToken from './handler.js';
import {GetAgentTokenEndpointParams} from './types.js';

/**
 * TODO:
 * - [Low] Check that onReferenced feature works
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getAgentToken', () => {
  test('referenced agent token returned', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {token: token01} = await insertAgentTokenForTest(
      agentToken,
      workspace.resourceId
    );

    const reqData = RequestData.fromExpressRequest<GetAgentTokenEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {tokenId: token01.resourceId, workspaceId: workspace.resourceId}
    );
    const result = await getAgentToken(reqData);
    assertEndpointResultOk(result);

    expect(result.token).toEqual(token01);
  });
});

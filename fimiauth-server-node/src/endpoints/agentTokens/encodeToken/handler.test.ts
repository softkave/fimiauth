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
import encodeAgentToken from './handler.js';
import {EncodeAgentTokenEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('encodeAgentToken', () => {
  test.each([true, false])(
    'token encoded, withRefresh=%s',
    async withRefresh => {
      const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
      const {token: token01} = await insertAgentTokenForTest(
        agentToken,
        workspace.resourceId,
        {shouldRefresh: withRefresh}
      );

      const reqData =
        RequestData.fromExpressRequest<EncodeAgentTokenEndpointParams>(
          mockExpressRequestWithAgentToken(agentToken),
          {tokenId: token01.resourceId, workspaceId: workspace.resourceId}
        );
      const result = await encodeAgentToken(reqData);
      assertEndpointResultOk(result);

      expect(result.jwtToken).toBeTruthy();

      if (withRefresh) {
        expect(result.refreshToken).toBeTruthy();
      } else {
        expect(result.refreshToken).not.toBeTruthy();
      }
    }
  );
});

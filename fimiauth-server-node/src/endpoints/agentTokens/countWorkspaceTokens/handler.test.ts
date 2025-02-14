import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertAgentTokenListForTest} from '../../testUtils/generate/agentToken.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import countWorkspaceAgentTokens from './handler.js';
import {CountWorkspaceAgentTokensEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('countWorkspaceAgentTokens', () => {
  test('count', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    await generateAndInsertAgentTokenListForTest(15, {
      workspaceId: workspace.resourceId,
    });
    const count = await kSemanticModels.agentToken().countByQuery({
      workspaceId: workspace.resourceId,
    });
    const reqData =
      RequestData.fromExpressRequest<CountWorkspaceAgentTokensEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await countWorkspaceAgentTokens(reqData);
    assertEndpointResultOk(result);
    expect(result.count).toBe(count);
  });
});

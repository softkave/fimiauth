import {calculatePageSize} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertAgentTokenListForTest} from '../../testUtils/generate/agentToken.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertAgentTokenForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getWorkspaceAgentTokens from './handler.js';
import {GetWorkspaceAgentTokensEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getWorkspaceAgentTokens', () => {
  test('workspace agent tokens returned', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [{token: token01}, {token: token02}] = await Promise.all([
      insertAgentTokenForTest(agentToken, workspace.resourceId),
      insertAgentTokenForTest(agentToken, workspace.resourceId),
    ]);
    const reqData =
      RequestData.fromExpressRequest<GetWorkspaceAgentTokensEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await getWorkspaceAgentTokens(reqData);
    assertEndpointResultOk(result);
    expect(result.tokens).toContainEqual(token01);
    expect(result.tokens).toContainEqual(token02);
  });

  test('pagination', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    await generateAndInsertAgentTokenListForTest(15, {
      workspaceId: workspace.resourceId,
    });
    const count = await kSemanticModels.agentToken().countByQuery({
      workspaceId: workspace.resourceId,
    });
    const pageSize = 10;
    let page = 0;
    let reqData =
      RequestData.fromExpressRequest<GetWorkspaceAgentTokensEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, workspaceId: workspace.resourceId}
      );
    let result = await getWorkspaceAgentTokens(reqData);
    assertEndpointResultOk(result);
    expect(result.page).toBe(page);
    expect(result.tokens).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );

    page = 1;
    reqData =
      RequestData.fromExpressRequest<GetWorkspaceAgentTokensEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, workspaceId: workspace.resourceId}
      );
    result = await getWorkspaceAgentTokens(reqData);
    assertEndpointResultOk(result);
    expect(result.page).toBe(page);
    expect(result.tokens).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );
  });
});

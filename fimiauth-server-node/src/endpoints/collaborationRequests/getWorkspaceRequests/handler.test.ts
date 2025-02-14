import {calculatePageSize} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertCollaborationRequestListForTest} from '../../testUtils/generate/collaborationRequest.js';
import {expectContainsEveryItemIn} from '../../testUtils/helpers/assertion.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertRequestForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getWorkspaceCollaborationRequests from './handler.js';
import {GetWorkspaceCollaborationRequestsEndpointParams} from './types.js';

/**
 * TODO:
 * - Confirm that all the requests returned belong to the workspace
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getWorkspaceRequests', () => {
  test('workspace collaboration requests returned', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {request: request01} = await insertRequestForTest(
      agentToken,
      workspace.resourceId
    );
    const {request: request02} = await insertRequestForTest(
      agentToken,
      workspace.resourceId
    );
    const reqData =
      RequestData.fromExpressRequest<GetWorkspaceCollaborationRequestsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await getWorkspaceCollaborationRequests(reqData);
    assertEndpointResultOk(result);
    expect(result.requests.length).toEqual(2);
    expectContainsEveryItemIn(
      result.requests,
      [request01, request02],
      item => item.resourceId
    );
  });

  test('pagination', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    await generateAndInsertCollaborationRequestListForTest(15, () => ({
      workspaceId: workspace.resourceId,
    }));
    const count = await kSemanticModels.collaborationRequest().countByQuery({
      workspaceId: workspace.resourceId,
    });
    const pageSize = 10;
    let page = 0;
    let reqData =
      RequestData.fromExpressRequest<GetWorkspaceCollaborationRequestsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, workspaceId: workspace.resourceId}
      );
    let result = await getWorkspaceCollaborationRequests(reqData);
    assertEndpointResultOk(result);
    expect(result.page).toBe(page);
    expect(result.requests).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );

    page = 1;
    reqData =
      RequestData.fromExpressRequest<GetWorkspaceCollaborationRequestsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, workspaceId: workspace.resourceId}
      );
    result = await getWorkspaceCollaborationRequests(reqData);
    assertEndpointResultOk(result);
    expect(result.page).toBe(page);
    expect(result.requests).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );
  });
});

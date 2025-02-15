import {
  calculatePageSize,
  kLoopAsyncSettlementType,
  loopAndCollateAsync,
} from 'softkave-js-utils';
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
import getUserWorkspaces from './handler.js';
import {GetUserWorkspacesEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getUserWorkspaces', () => {
  test('pagination', async () => {
    const {agentToken} = await generateWorkspaceAndSessionAgent();
    const userId = agentToken.forEntityId;
    appAssert(userId);
    await loopAndCollateAsync(
      () => insertWorkspaceForTest({userId}),
      14,
      kLoopAsyncSettlementType.all
    );

    const pageSize = 10;
    let page = 0;
    let reqData =
      RequestData.fromExpressRequest<GetUserWorkspacesEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, userId}
      );
    const result00 = await getUserWorkspaces(reqData);
    assertEndpointResultOk(result00);
    expect(result00.page).toBe(page);
    expect(result00.workspaces).toHaveLength(
      calculatePageSize(15, pageSize, page)
    );

    page = 1;
    reqData = RequestData.fromExpressRequest<GetUserWorkspacesEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {page, pageSize, userId}
    );
    const result01 = await getUserWorkspaces(reqData);
    assertEndpointResultOk(result01);
    expect(result00.workspaces.map(w => w.workspace.resourceId)).not.toContain(
      result01.workspaces.map(w => w.workspace.resourceId)
    );
    expect(result01.page).toBe(page);
    expect(result01.workspaces).toHaveLength(
      calculatePageSize(15, pageSize, page)
    );
  });
});

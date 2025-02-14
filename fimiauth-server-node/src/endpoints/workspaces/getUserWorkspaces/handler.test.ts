import {
  calculatePageSize,
  kLoopAsyncSettlementType,
  loopAndCollateAsync,
} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {appAssert} from '../../../utils/assertion.js';
import {getResourceId} from '../../../utils/fns.js';
import RequestData from '../../RequestData.js';
import EndpointReusableQueries from '../../queries.js';
import {generateAndInsertWorkspaceListForTest} from '../../testUtils/generate/workspace.js';
import {expectContainsNoneIn} from '../../testUtils/helpers/assertion.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
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
    const {userToken, rawUser} = await insertUserForTest();
    const workspaces = await generateAndInsertWorkspaceListForTest(15);
    await loopAndCollateAsync(
      () => insertWorkspaceForTest(userToken),
      15,
      kLoopAsyncSettlementType.all
    );

    appAssert(userToken.forEntityId);
    const user = await populateUserWorkspaces(
      await kSemanticModels
        .user()
        .assertGetOneByQuery(
          EndpointReusableQueries.getByResourceId(userToken.forEntityId)
        )
    );
    const count = user.workspaces.length;
    const pageSize = 10;
    let page = 0;
    let reqData =
      RequestData.fromExpressRequest<GetUserWorkspacesEndpointParams>(
        mockExpressRequestWithAgentToken(userToken),
        {page, pageSize}
      );
    const result00 = await getUserWorkspaces(reqData);
    assertEndpointResultOk(result00);
    expect(result00.page).toBe(page);
    expect(result00.workspaces).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );

    page = 1;
    reqData = RequestData.fromExpressRequest<GetUserWorkspacesEndpointParams>(
      mockExpressRequestWithAgentToken(userToken),
      {page, pageSize}
    );
    const result01 = await getUserWorkspaces(reqData);
    assertEndpointResultOk(result01);
    expectContainsNoneIn(
      result00.workspaces,
      result01.workspaces,
      getResourceId
    );
    expect(result01.page).toBe(page);
    expect(result01.workspaces).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );
  });
});

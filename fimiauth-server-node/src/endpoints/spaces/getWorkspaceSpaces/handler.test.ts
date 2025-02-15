import {calculatePageSize} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {findItemWithField} from '../../../utils/fns.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertPermissionGroupListForTest} from '../../testUtils/generate/permissionGroup.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getWorkspaceSpaces from './handler.js';
import {GetWorkspaceSpacesEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getWorkspaceSpaces', () => {
  test("workspace's spaces returned", async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {permissionGroup: permissionGroup01} =
      await insertPermissionGroupForTest(agentToken, workspace.resourceId);
    const {permissionGroup: permissionGroup02} =
      await insertPermissionGroupForTest(agentToken, workspace.resourceId);

    const reqData =
      RequestData.fromExpressRequest<GetWorkspaceSpacesEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await getWorkspaceSpaces(reqData);
    assertEndpointResultOk(result);
    const resultPermissionGroup01 = findItemWithField(
      result.spaces,
      permissionGroup01.resourceId,
      'resourceId'
    );

    const resultPermissionGroup02 = findItemWithField(
      result.spaces,
      permissionGroup02.resourceId,
      'resourceId'
    );
    expect(resultPermissionGroup01).toMatchObject(permissionGroup01);
    expect(resultPermissionGroup02).toMatchObject(permissionGroup02);
  });

  test('pagination', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    await generateAndInsertPermissionGroupListForTest(15, {
      workspaceId: workspace.resourceId,
    });
    const count = await kSemanticModels.permissionGroup().countByQuery({
      workspaceId: workspace.resourceId,
    });
    const pageSize = 10;
    let page = 0;
    let reqData =
      RequestData.fromExpressRequest<GetWorkspaceSpacesEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, workspaceId: workspace.resourceId}
      );
    let result = await getWorkspaceSpaces(reqData);
    assertEndpointResultOk(result);
    expect(result.page).toBe(page);
    expect(result.spaces).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );

    page = 1;
    reqData = RequestData.fromExpressRequest<GetWorkspaceSpacesEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {page, pageSize, workspaceId: workspace.resourceId}
    );
    result = await getWorkspaceSpaces(reqData);
    assertEndpointResultOk(result);
    expect(result.page).toBe(page);
    expect(result.spaces).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );
  });
});

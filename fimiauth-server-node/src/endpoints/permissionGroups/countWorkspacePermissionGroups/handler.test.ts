import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertPermissionGroupListForTest} from '../../testUtils/generate/permissionGroup.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import countWorkspacePermissionGroups from './handler.js';
import {CountWorkspacePermissionGroupsEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('countWorkspacePermissionGroups', () => {
  test('count', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    await generateAndInsertPermissionGroupListForTest(15, {
      workspaceId: workspace.resourceId,
    });
    const count = await kSemanticModels.permissionGroup().countByQuery({
      workspaceId: workspace.resourceId,
    });
    const reqData =
      RequestData.fromExpressRequest<CountWorkspacePermissionGroupsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await countWorkspacePermissionGroups(reqData);
    assertEndpointResultOk(result);
    expect(result.count).toBe(count);
  });
});

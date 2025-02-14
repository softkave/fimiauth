import {afterAll, beforeAll, expect, test} from 'vitest';
import {PermissionGroupMatcher} from '../../../definitions/permissionGroups.js';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getPermissionGroup from './handler.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('referenced permissionGroup returned', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const {permissionGroup: permissionGroup} = await insertPermissionGroupForTest(
    agentToken,
    workspace.resourceId
  );

  const reqData = RequestData.fromExpressRequest<PermissionGroupMatcher>(
    mockExpressRequestWithAgentToken(agentToken),
    {permissionGroupId: permissionGroup.resourceId}
  );
  const result = await getPermissionGroup(reqData);
  assertEndpointResultOk(result);
  expect(result.permissionGroup).toMatchObject(permissionGroup);
});

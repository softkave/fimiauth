import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {permissionGroupExtractor} from '../../permissionGroups/utils.js';
import EndpointReusableQueries from '../../queries.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
} from '../../testUtils/testUtils.js';

/**
 * TODO:
 * [Low] - Test that hanlder fails if permissionGroup exists
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('addPermissionGroup', () => {
  test('permissionGroup permissions group added', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {permissionGroup: permissionGroup} =
      await insertPermissionGroupForTest(agentToken, workspace.resourceId);
    const savedPermissionGroup = await kSemanticModels
      .permissionGroup()
      .assertGetOneByQuery(
        EndpointReusableQueries.getByResourceId(permissionGroup.resourceId)
      );
    expect(permissionGroupExtractor(savedPermissionGroup)).toMatchObject(
      permissionGroup
    );
  });
});

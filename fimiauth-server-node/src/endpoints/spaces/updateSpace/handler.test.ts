import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import EndpointReusableQueries from '../../queries.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import updatePermissionGroup from './handler.js';
import {
  UpdatePermissionGroupEndpointParams,
  UpdatePermissionGroupInput,
} from './types.js';
import {permissionGroupExtractor} from '../../permissionGroups/utils.js';

/**
 * TODO:
 * - [Low] Test that hanlder fails if assigned permissionGroups doesn't exist
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('permissionGroup updated', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const {permissionGroup: permissionGroup00} =
    await insertPermissionGroupForTest(agentToken, workspace.resourceId);
  await insertPermissionGroupForTest(agentToken, workspace.resourceId);
  await insertPermissionGroupForTest(agentToken, workspace.resourceId);

  const updatePermissionGroupInput: UpdatePermissionGroupInput = {
    name: faker.lorem.words(2),
    description: faker.lorem.words(10),
  };
  const reqData =
    RequestData.fromExpressRequest<UpdatePermissionGroupEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {
        permissionGroupId: permissionGroup00.resourceId,
        data: updatePermissionGroupInput,
      }
    );

  const result = await updatePermissionGroup(reqData);
  assertEndpointResultOk(result);

  const updatedPermissionGroup = await populateAssignedTags(
    workspace.resourceId,
    await kSemanticModels
      .permissionGroup()
      .assertGetOneByQuery(
        EndpointReusableQueries.getByResourceId(permissionGroup00.resourceId)
      )
  );

  expect(permissionGroupExtractor(updatedPermissionGroup)).toMatchObject(
    result.permissionGroup
  );
  expect(updatedPermissionGroup.name).toEqual(updatePermissionGroupInput.name);
  expect(updatedPermissionGroup.description).toEqual(
    updatePermissionGroupInput.description
  );
});

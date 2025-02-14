import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {fetchEntityAssignedPermissionGroupList} from '../../permissionGroups/getEntityAssignedPermissionGroups/utils.js';
import EndpointReusableQueries from '../../queries.js';
import {expectErrorThrown} from '../../testUtils/helpers/error.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  generateWorkspaceAndSessionAgent,
  initTests,
  insertWorkspaceForTest,
} from '../../testUtils/testUtils.js';
import {WorkspaceExistsError} from '../errors.js';
import {assertWorkspace, workspaceExtractor} from '../utils.js';
import {AddWorkspaceEndpointParams} from './types.js';
import {
  kDefaultAdminPermissionGroupName,
  kDefaultPublicPermissionGroupName,
} from './utils.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('addWorkspace', () => {
  test('workspace created', async () => {
    const companyName = faker.company.name();
    const companyInput: AddWorkspaceEndpointParams = {
      name: companyName,
      description: faker.company.catchPhraseDescriptor(),
      userId: faker.string.uuid(),
    };

    const result = await insertWorkspaceForTest(companyInput);
    expect(result.workspace).toMatchObject(companyInput);
    expect(result.workspace.publicPermissionGroupId).toBeTruthy();
    const workspace = await kSemanticModels
      .workspace()
      .getOneByQuery(
        EndpointReusableQueries.getByResourceId(result.workspace.resourceId)
      );
    assertWorkspace(workspace);
    expect(workspaceExtractor(workspace)).toMatchObject(result.workspace);

    const adminPermissionGroup = await kSemanticModels
      .permissionGroup()
      .assertGetOneByQuery(
        EndpointReusableQueries.getByWorkspaceIdAndName(
          workspace.resourceId,
          kDefaultAdminPermissionGroupName
        )
      );
    await kSemanticModels
      .permissionGroup()
      .assertGetOneByQuery(
        EndpointReusableQueries.getByWorkspaceIdAndName(
          workspace.resourceId,
          kDefaultPublicPermissionGroupName
        )
      );

    const userPermissionGroupsResult =
      await fetchEntityAssignedPermissionGroupList({
        entityId: result.agentToken.resourceId,
        spaceId: workspace.spaceId,
      });
    const assignedAdminPermissionGroup =
      userPermissionGroupsResult.permissionGroups.find(
        item => item.resourceId === adminPermissionGroup.resourceId
      );
    expect(assignedAdminPermissionGroup).toBeTruthy();
  });

  test('fails if workspace name exists', async () => {
    const {workspace} = await generateWorkspaceAndSessionAgent();
    await expectErrorThrown(async () => {
      await insertWorkspaceForTest({
        name: workspace.name,
      });
    }, [WorkspaceExistsError.name]);
  });
});

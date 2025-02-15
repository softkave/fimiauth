import assert from 'assert';
import {first} from 'lodash-es';
import {sortStringListLexicographically} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {extractResourceIdList} from '../../../utils/fns.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertCollaboratorListForTest} from '../../testUtils/generate/collaborator.js';
import {generateAndInsertPermissionGroupListForTest} from '../../testUtils/generate/permissionGroup.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import {fetchEntityAssignedPermissionGroupList} from '../getEntityAssignedPermissionGroups/utils.js';
import {toAssignedPgListInput} from '../testUtils.js';
import assignPermissionGroups from './handler.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('assignPermissionGroups', () => {
  test('assign permission groups to users', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [pgList01, collaboratorList] = await Promise.all([
      generateAndInsertPermissionGroupListForTest(2, {
        workspaceId: workspace.resourceId,
      }),
      generateAndInsertCollaboratorListForTest(2, () => ({
        workspaceId: workspace.resourceId,
      })),
    ]);
    const pgList01Input = toAssignedPgListInput(pgList01);

    const result01 = await assignPermissionGroups(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          permissionGroupId: pgList01Input,
          entityId: extractResourceIdList(collaboratorList),
        }
      )
    );
    assertEndpointResultOk(result01);

    const permissionGroupsResult = await Promise.all(
      collaboratorList.map(collaborator =>
        fetchEntityAssignedPermissionGroupList({
          entityId: collaborator.resourceId,
          spaceId: workspace.resourceId,
          includeInheritedPermissionGroups: false,
        })
      )
    );
    permissionGroupsResult.forEach(next => {
      expect(
        sortStringListLexicographically(
          extractResourceIdList(next.permissionGroups)
        )
      ).toEqual(sortStringListLexicographically(pgList01Input));
    });
  });

  test('assign permission groups to single user', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [pgList01, collaboratorList] = await Promise.all([
      generateAndInsertPermissionGroupListForTest(2, {
        workspaceId: workspace.resourceId,
      }),
      generateAndInsertCollaboratorListForTest(1, () => ({
        workspaceId: workspace.resourceId,
      })),
    ]);
    const pgList01Input = toAssignedPgListInput(pgList01);
    const collaborator = first(collaboratorList);
    assert(collaborator);

    const result01 = await assignPermissionGroups(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          permissionGroupId: pgList01Input,
          entityId: collaborator.resourceId,
        }
      )
    );
    assertEndpointResultOk(result01);

    const permissionGroupsResult = await fetchEntityAssignedPermissionGroupList(
      {
        entityId: collaborator.resourceId,
        spaceId: workspace.resourceId,
        includeInheritedPermissionGroups: false,
      }
    );
    expect(
      sortStringListLexicographically(
        extractResourceIdList(permissionGroupsResult.permissionGroups)
      )
    ).toEqual(sortStringListLexicographically(pgList01Input));
  });
});

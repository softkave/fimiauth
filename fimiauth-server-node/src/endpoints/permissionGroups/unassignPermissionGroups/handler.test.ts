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
import {assignPgListToIdList, toAssignedPgListInput} from '../testUtils.js';
import unassignPermissionGroups from './handler.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('unassignPermissionGroups', () => {
  test('permission groups unassigned', async () => {
    const {workspace, sessionAgent, agentToken} =
      await generateWorkspaceAndSessionAgent();
    const [pgList01, cList01] = await Promise.all([
      generateAndInsertPermissionGroupListForTest(2, {
        workspaceId: workspace.resourceId,
      }),
      generateAndInsertCollaboratorListForTest(
        sessionAgent,
        workspace.resourceId,
        2
      ),
    ]);
    const cList01Ids = extractResourceIdList(cList01);
    const pgList01Ids = extractResourceIdList(pgList01);
    await assignPgListToIdList(
      sessionAgent,
      workspace.resourceId,
      cList01Ids,
      toAssignedPgListInput(pgList01)
    );

    const result01 = await unassignPermissionGroups(
      RequestData.fromExpressRequest(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          permissionGroupId: pgList01Ids,
          entityId: cList01Ids,
        }
      )
    );
    assertEndpointResultOk(result01);

    const entityPgListResult = await Promise.all(
      cList01.map(collaborator =>
        fetchEntityAssignedPermissionGroupList(collaborator.resourceId, false)
      )
    );
    const entityPgListId: string[] = [];
    entityPgListResult.forEach(next => {
      next.permissionGroups.forEach(pg => entityPgListId.push(pg.resourceId));
    });
    expect(entityPgListId).not.toEqual(expect.arrayContaining(pgList01Ids));
  });
});

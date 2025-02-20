import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {makeKey} from '../../../utils/fns.js';
import {
  assignPgListToIdList,
  toAssignedPgListInput,
} from '../../permissionGroups/testUtils.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertPermissionGroupListForTest} from '../../testUtils/generate/permissionGroup.js';
import {generateAndInsertSpaceListForTest} from '../../testUtils/generate/space.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionItemsForTest,
  insertSpaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import {kDefaultAdminPermissionGroupName} from '../../workspaces/addWorkspace/utils.js';
import {PermissionItemInput} from '../types.js';
import resolveEntityPermissions from './handler.js';
import {
  ResolveEntityPermissionsEndpointParams,
  ResolvedEntityPermissionItem,
} from './types.js';

// TODO: test container and target appliesTo

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('resolveEntityPermissions', () => {
  test('correct results returned', async () => {
    const {workspace, sessionAgent, agentToken} =
      await generateWorkspaceAndSessionAgent();
    const [[pg01, pg02, pg03, pg04, pg05], [file01]] = await Promise.all([
      generateAndInsertPermissionGroupListForTest(/** count */ 5, {
        workspaceId: workspace.resourceId,
      }),
      generateAndInsertSpaceListForTest({
        count: 1,
        seed: {
          workspaceId: workspace.resourceId,
        },
      }),
    ]);

    // Allows access to all files
    const pItem01: PermissionItemInput = {
      action: 'readFile',
      targetId: workspace.resourceId,
      access: true,
      entityId: pg01.resourceId,
    };

    // Allows access to a single file
    const pItem02: PermissionItemInput = {
      action: 'readFile',
      targetId: file01.resourceId,
      access: true,
      entityId: pg02.resourceId,
    };

    // Denies access to all files
    const pItem03: PermissionItemInput = {
      action: 'readFile',
      targetId: workspace.resourceId,
      access: false,
      entityId: pg03.resourceId,
    };
    await insertPermissionItemsForTest(agentToken, workspace.resourceId, [
      pItem01,
      pItem02,
      pItem03,
    ]);

    // Assign pg01 to another to grant it it's permissions
    await assignPgListToIdList(
      sessionAgent,
      workspace.resourceId,
      [pg04.resourceId],
      toAssignedPgListInput([pg01])
    );

    // Test
    const reqData =
      RequestData.fromExpressRequest<ResolveEntityPermissionsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          items: [
            {
              action: 'readFile',
              targetId: workspace.resourceId,
              entityId: [
                pg01.resourceId,
                pg02.resourceId,
                pg03.resourceId,
                pg04.resourceId,
                pg05.resourceId,
              ],
            },
            {
              action: 'readFile',
              targetId: file01.resourceId,
              entityId: [pg02.resourceId, pg04.resourceId],
            },
          ],
        }
      );
    const result = await resolveEntityPermissions(reqData);
    assertEndpointResultOk(result);

    const expected = [
      indexResolvedPermissions({
        entityId: pg01.resourceId,
        action: 'readFile',
        access: true,
        targetId: workspace.resourceId,
      }),
      indexResolvedPermissions({
        entityId: pg02.resourceId,
        action: 'readFile',
        access: true,
        targetId: file01.resourceId,
      }),
      indexResolvedPermissions({
        entityId: pg03.resourceId,
        action: 'readFile',
        access: false,
        targetId: workspace.resourceId,
      }),
      indexResolvedPermissions({
        entityId: pg02.resourceId,
        action: 'readFile',
        access: false,
        targetId: workspace.resourceId,
      }),
      indexResolvedPermissions({
        entityId: pg04.resourceId,
        action: 'readFile',
        access: true,
        targetId: workspace.resourceId,
      }),
      indexResolvedPermissions({
        entityId: pg05.resourceId,
        action: 'readFile',
        access: false,
        targetId: workspace.resourceId,
      }),
      indexResolvedPermissions({
        entityId: pg04.resourceId,
        action: 'readFile',
        access: true,
        targetId: file01.resourceId,
      }),
    ];

    const resolved = result.items.map(indexResolvedPermissions);
    expected.forEach(nextExpected => expect(resolved).toContain(nextExpected));
    expect(result.items.length).toBe(expected.length);
  });

  test('combination of wildcard and appliesTo', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {rawSpace: folder} = await insertSpaceForTest({
      agentToken,
      workspaceId: workspace.resourceId,
    });
    const adminPg = await kSemanticModels
      .permissionGroup()
      .assertGetOneByQuery({
        name: kDefaultAdminPermissionGroupName,
        workspaceId: workspace.resourceId,
      });

    const reqData =
      RequestData.fromExpressRequest<ResolveEntityPermissionsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          items: [
            {
              action: 'readFolder',
              targetId: folder.resourceId,
              entityId: adminPg.resourceId,
            },
          ],
        }
      );
    const result = await resolveEntityPermissions(reqData);
    assertEndpointResultOk(result);

    const expected = [
      indexResolvedPermissions({
        entityId: adminPg.resourceId,
        action: 'readFolder',
        access: true,
        targetId: folder.resourceId,
      }),
    ];
    const resolved = result.items.map(indexResolvedPermissions);
    expected.forEach(nextExpected => expect(resolved).toContain(nextExpected));
  });
});

function indexResolvedPermissions(item: ResolvedEntityPermissionItem) {
  return makeKey([item.entityId, item.targetId, item.action, item.access]);
}

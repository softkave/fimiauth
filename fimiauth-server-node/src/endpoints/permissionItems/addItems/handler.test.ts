import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {checkAuthorization} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertSpaceListForTest} from '../../testUtils/generate/space.js';
import {expectErrorThrown} from '../../testUtils/helpers/error.js';
import {expectEntityHasPermissionsTargetingId} from '../../testUtils/helpers/permissionItem.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import PermissionItemQueries from '../queries.js';
import {PermissionItemInput} from '../types.js';
import addPermissionItems from './handler.js';
import {AddPermissionItemsEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('addItems', () => {
  test('permission items added', async () => {
    // TODO: add more tests for target and appliesTo
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [
      {permissionGroup: pg01},
      {permissionGroup: pg02},
      {permissionGroup: pg03},
      {permissionGroup: pg04},
    ] = await Promise.all([
      insertPermissionGroupForTest(agentToken, workspace.resourceId),
      insertPermissionGroupForTest(agentToken, workspace.resourceId),
      insertPermissionGroupForTest(agentToken, workspace.resourceId),
      insertPermissionGroupForTest(agentToken, workspace.resourceId),
    ]);

    const grantAccess = faker.datatype.boolean();
    const actionsWithoutWildcard = Object.values(
      kFimidaraPermissionActions
    ).filter(action => action !== kFimidaraPermissionActions.wildcard);
    const subsetWorkspaceActions = faker.helpers.arrayElements(
      actionsWithoutWildcard
    );
    const completeWorkspaceActionsInputItems = actionsWithoutWildcard
      .map((action): PermissionItemInput[] =>
        [pg01.resourceId, pg02.resourceId].map(entityId => ({
          action,
          access: grantAccess,
          targetId: workspace.resourceId,
          entityId,
        }))
      )
      .flat();
    const subsetWorkspaceActionsInputItems = subsetWorkspaceActions
      .map((action): PermissionItemInput[] =>
        [
          pg01.resourceId,
          pg02.resourceId,
          pg03.resourceId,
          pg04.resourceId,
        ].map(entityId => ({
          action,
          access: grantAccess,
          targetId: workspace.resourceId,
          entityId,
        }))
      )
      .flat();

    const reqData =
      RequestData.fromExpressRequest<AddPermissionItemsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {
          items: completeWorkspaceActionsInputItems.concat(
            subsetWorkspaceActionsInputItems
          ),
          workspaceId: workspace.resourceId,
        }
      );
    const result = await addPermissionItems(reqData);
    assertEndpointResultOk(result);

    await Promise.all(
      [pg01, pg02].map(pg =>
        expectEntityHasPermissionsTargetingId(
          pg.resourceId,
          actionsWithoutWildcard,
          workspace.resourceId,
          /** expected result */ grantAccess
        )
      )
    );
    await Promise.all(
      [pg03, pg04].map(pg =>
        expectEntityHasPermissionsTargetingId(
          pg.resourceId,
          subsetWorkspaceActions,
          workspace.resourceId,
          /** expected result */ grantAccess
        )
      )
    );

    async function randomCheckAuth() {
      await checkAuthorization({
        workspaceId: workspace.resourceId,
        spaceId: workspace.spaceId,
        target: {
          entityId: faker.helpers.arrayElement([
            pg01.resourceId,
            pg02.resourceId,
          ]),
          action: faker.helpers.arrayElement(actionsWithoutWildcard),
          targetId: workspace.resourceId,
        },
      });
      await checkAuthorization({
        workspaceId: workspace.resourceId,
        spaceId: workspace.spaceId,
        target: {
          entityId: faker.helpers.arrayElement([
            pg01.resourceId,
            pg02.resourceId,
            pg03.resourceId,
            pg04.resourceId,
          ]),
          action: faker.helpers.arrayElement(subsetWorkspaceActions),
          targetId: workspace.resourceId,
        },
      });
    }

    if (grantAccess) {
      await randomCheckAuth();
    } else {
      await expectErrorThrown(randomCheckAuth);
    }
  });

  test('permission items are not duplicated', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {permissionGroup: permissionGroup} =
      await insertPermissionGroupForTest(agentToken, workspace.resourceId);
    const grantAccess = faker.datatype.boolean();
    const actions = Object.values(kFimidaraPermissionActions);
    const actionsWithoutWildcard = actions.filter(
      action => action !== kFimidaraPermissionActions.wildcard
    );
    const itemsUniq = actionsWithoutWildcard.map(
      (action): PermissionItemInput => ({
        action,
        access: grantAccess,
        targetId: workspace.resourceId,
        entityId: permissionGroup.resourceId,
      })
    );
    const itemsDuplicated = actionsWithoutWildcard
      .concat(actionsWithoutWildcard)
      .map(
        (action): PermissionItemInput => ({
          action,
          access: grantAccess,
          targetId: workspace.resourceId,
          entityId: permissionGroup.resourceId,
        })
      );
    const reqData =
      RequestData.fromExpressRequest<AddPermissionItemsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {items: itemsDuplicated, workspaceId: workspace.resourceId}
      );

    // First insert
    await addPermissionItems(reqData);

    // Second insert of the very same permission items as the first insert
    const result = await addPermissionItems(reqData);
    assertEndpointResultOk(result);

    const pgPermissionItems = await kSemanticModels
      .permissionItem()
      .getManyByQuery(
        PermissionItemQueries.getByPermissionEntity(permissionGroup.resourceId)
      );
    expect(pgPermissionItems.length).toBe(itemsUniq.length);
  });

  test('permission items folded into wildcard', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {permissionGroup} = await insertPermissionGroupForTest(
      agentToken,
      workspace.resourceId
    );
    const grantAccess = faker.datatype.boolean();
    const actions = Object.values(kFimidaraPermissionActions);
    const itemsUniq = actions.map(
      (action): PermissionItemInput => ({
        action,
        access: grantAccess,
        targetId: workspace.resourceId,
        entityId: permissionGroup.resourceId,
      })
    );
    const reqData =
      RequestData.fromExpressRequest<AddPermissionItemsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {items: itemsUniq, workspaceId: workspace.resourceId}
      );

    let result = await addPermissionItems(reqData);
    assertEndpointResultOk(result);

    let pgPermissionItems = await kSemanticModels
      .permissionItem()
      .getManyByQuery(
        PermissionItemQueries.getByPermissionEntity(permissionGroup.resourceId)
      );
    expect(pgPermissionItems.length).toBe(1);

    // Trying again
    result = await addPermissionItems(reqData);
    assertEndpointResultOk(result);

    pgPermissionItems = await kSemanticModels
      .permissionItem()
      .getManyByQuery(
        PermissionItemQueries.getByPermissionEntity(permissionGroup.resourceId)
      );
    expect(pgPermissionItems.length).toBe(1);
  });

  test('correct targetParentId added', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [folder01] = await generateAndInsertSpaceListForTest({
      count: 1,
      seed: {
        workspaceId: workspace.resourceId,
      },
    });
    const [folder02] = await generateAndInsertSpaceListForTest({
      count: 1,
      seed: {
        workspaceId: workspace.resourceId,
      },
    });
    const itemsInput: PermissionItemInput[] = [
      {
        access: true,
        action: kFimidaraPermissionActions.readSpace,
        entityId: agentToken.resourceId,
        targetId: folder01.resourceId,
      },
      {
        access: true,
        action: kFimidaraPermissionActions.readSpace,
        entityId: agentToken.resourceId,
        targetId: folder02.resourceId,
      },
    ];
    const reqData =
      RequestData.fromExpressRequest<AddPermissionItemsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {items: itemsInput, workspaceId: workspace.resourceId}
      );

    const result = await addPermissionItems(reqData);
    assertEndpointResultOk(result);

    const pItems = await kSemanticModels
      .permissionItem()
      .getManyByQuery(
        PermissionItemQueries.getByPermissionEntity(agentToken.resourceId)
      );
    const pItemFolder01 = pItems.find(
      item => item.targetId === folder01.resourceId
    );
    const pItemFolder02 = pItems.find(
      item => item.targetId === folder02.resourceId
    );
    expect(pItemFolder01).toBeTruthy();
    expect(pItemFolder02).toBeTruthy();
    expect(pItemFolder01?.containerId).toBe(workspace.resourceId);
    expect(pItemFolder02?.containerId).toBe(folder01.resourceId);
  });
});

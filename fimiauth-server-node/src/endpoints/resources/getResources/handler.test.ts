import {faker} from '@faker-js/faker';
import {flatten} from 'lodash-es';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {
  FimidaraPermissionAction,
  kFimidaraPermissionActions,
} from '../../../definitions/permissionItem.js';
import {Resource, kFimidaraResourceType} from '../../../definitions/system.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertPermissionItemListForTest} from '../../testUtils/generate/permissionItem.js';
import {generateAndInsertSpaceListForTest} from '../../testUtils/generate/space.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import {FetchResourceItem} from '../types.js';
import getResources from './handler.js';
import {GetResourcesEndpointParams} from './types.js';

/**
 * TODO:
 * - test resources that the agent doesn't have read permission to
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getResources', () => {
  test('resources returned', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [{permissionGroup}, spaces] = await Promise.all([
      insertPermissionGroupForTest(agentToken, workspace.resourceId),
      generateAndInsertSpaceListForTest({
        count: 2,
        seed: {
          workspaceId: workspace.resourceId,
        },
      }),
    ]);
    const itemsList = await Promise.all(
      Object.values(kFimidaraPermissionActions).map(action =>
        generateAndInsertPermissionItemListForTest(1, {
          action,
          access: faker.datatype.boolean(),
          targetId: workspace.resourceId,
          targetType: kFimidaraResourceType.Workspace,
          workspaceId: workspace.resourceId,
          entityId: permissionGroup.resourceId,
        })
      )
    );
    const items = flatten(itemsList);
    const resourcesInput: FetchResourceItem[] = [];
    const resourcesMap: Record<string, unknown> = {};

    const addToExpectedResourcesById = (
      item: Pick<Resource, 'resourceId'>,
      action: FimidaraPermissionAction
    ) => {
      resourcesInput.push({action, resourceId: item.resourceId});
      resourcesMap[item.resourceId] = item;
    };

    addToExpectedResourcesById(
      workspace,
      kFimidaraPermissionActions.readWorkspace
    );
    addToExpectedResourcesById(
      permissionGroup,
      kFimidaraPermissionActions.updatePermission
    );
    items.forEach(item =>
      addToExpectedResourcesById(
        item,
        kFimidaraPermissionActions.updatePermission
      )
    );
    spaces.forEach(folder => {
      resourcesInput.push({
        resourceId: folder.resourceId,
        action: kFimidaraPermissionActions.readSpace,
      });
      resourcesMap[folder.resourceId] = folder;
    });

    const reqData = RequestData.fromExpressRequest<GetResourcesEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {workspaceId: workspace.resourceId, resources: resourcesInput}
    );
    const result = await getResources(reqData);

    assertEndpointResultOk(result);
    expect(result.resources).toHaveLength(resourcesInput.length);
    result.resources.forEach(resource => {
      expect(resourcesMap[resource.resourceId]).toMatchObject(
        resource.resource
      );
    });
  });
});

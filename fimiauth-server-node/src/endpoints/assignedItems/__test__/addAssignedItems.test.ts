import {identity} from 'lodash-es';
import {afterAll, beforeAll, describe, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {AssignedItem} from '../../../definitions/assignedItem.js';
import {extractResourceIdList, makeKey} from '../../../utils/fns.js';
import {
  assignPgListToIdList,
  toAssignedPgListInput,
} from '../../permissionGroups/testUtils.js';
import {generateAndInsertPermissionGroupListForTest} from '../../testUtils/generate/permissionGroup.js';
import {expectContainsEveryItemInForAnyType} from '../../testUtils/helpers/assertion.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  generateWorkspaceAndSessionAgent,
  initTests,
} from '../../testUtils/testUtils.js';
import {addAssignedPermissionGroupList} from '../addAssignedItems.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('addAssignedItems', () => {
  test('addAssignedPermissionGroupList does not duplicate', async () => {
    const {workspace, sessionAgent} = await generateWorkspaceAndSessionAgent();
    const [pgList01, pgListAssignedTo01, pgListAssignedTo02] =
      await Promise.all([
        generateAndInsertPermissionGroupListForTest(2, {
          workspaceId: workspace.resourceId,
        }),
        generateAndInsertPermissionGroupListForTest(2, {
          workspaceId: workspace.resourceId,
        }),
        generateAndInsertPermissionGroupListForTest(2, {
          workspaceId: workspace.resourceId,
        }),
      ]);
    const pgListAssignedTo01Input = toAssignedPgListInput(pgListAssignedTo01);
    const pgListAssignedTo02Input = toAssignedPgListInput(pgListAssignedTo02);
    const pgList01IdList = extractResourceIdList(pgList01);
    await assignPgListToIdList(
      sessionAgent,
      workspace.resourceId,
      pgList01IdList,
      pgListAssignedTo01Input
    );

    const assignedItems = await kSemanticModels.utils().withTxn(opts =>
      addAssignedPermissionGroupList({
        agent: sessionAgent,
        workspaceId: workspace.resourceId,
        spaceId: workspace.resourceId,
        permissionGroupsInput: pgListAssignedTo02Input,
        assigneeId: pgList01IdList,
        deleteExisting: false, // do not delete existing items
        skipPermissionGroupsExistCheck: true, // skip permission groups check
        skipAuthCheck: false, // skip auth check
        opts,
      })
    );

    expectContainsEveryItemInForAnyType(
      assignedItems,
      pgListAssignedTo02Input,
      pgAssignedItemKey,
      identity
    );

    const savedItems = await kSemanticModels.assignedItem().getManyByQuery({
      assigneeId: {$in: pgList01IdList},
    });
    expectContainsEveryItemInForAnyType(
      savedItems,
      pgListAssignedTo02Input.concat(pgListAssignedTo01Input),
      pgAssignedItemKey,
      identity
    );
  });
});

const pgAssignedItemKey = (item: AssignedItem) =>
  makeKey([item.assignedItemId]);

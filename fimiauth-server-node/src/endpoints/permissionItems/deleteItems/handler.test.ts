import {afterAll, beforeAll, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {Job, kJobType} from '../../../definitions/job.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {sortObjectKeys} from '../../../utils/fns.js';
import RequestData from '../../RequestData.js';
import {expectContainsEveryItemInForAnyType} from '../../testUtils/helpers/assertion.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertPermissionGroupForTest,
  insertPermissionItemsForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import deletePermissionItems from './handler.js';
import {
  DeletePermissionItemInput,
  DeletePermissionItemsEndpointParams,
} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('permission items deleted', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const [{permissionGroup: pg01}, {permissionGroup: pg02}] = await Promise.all([
    insertPermissionGroupForTest(agentToken, workspace.resourceId),
    insertPermissionGroupForTest(agentToken, workspace.resourceId),
  ]);
  await Promise.all([
    insertPermissionItemsForTest(agentToken, workspace.resourceId, {
      entityId: pg01.resourceId,
      targetId: workspace.resourceId,
      access: true,
      action: kFimidaraPermissionActions.addSpace,
    }),
    insertPermissionItemsForTest(agentToken, workspace.resourceId, {
      entityId: pg02.resourceId,
      targetId: workspace.resourceId,
      access: true,
      action: kFimidaraPermissionActions.addSpace,
    }),
  ]);

  const params: DeletePermissionItemsEndpointParams = {
    workspaceId: workspace.resourceId,
    items: [
      {
        action: kFimidaraPermissionActions.addSpace,
        targetId: workspace.resourceId,
        entityId: pg01.resourceId,
      },
      {entityId: pg02.resourceId},
    ],
  };
  const reqData =
    RequestData.fromExpressRequest<DeletePermissionItemsEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      params
    );
  const result = await deletePermissionItems(reqData);
  assertEndpointResultOk(result);

  const jobs = (await kSemanticModels.job().getManyByQuery({
    type: kJobType.deletePermissionItem,
    resourceId: {$in: result.jobIds},
    workspaceId: workspace.resourceId,
    createdBy: {
      $objMatch: {
        agentId: agentToken.forEntityId,
        agentType: kFimidaraResourceType.AgentToken,
        agentTokenId: agentToken.resourceId,
      },
    },
  })) as Job<DeletePermissionItemInput>[];

  expect(jobs).toHaveLength(params.items.length);
  expectContainsEveryItemInForAnyType(
    jobs,
    params.items,
    job => {
      const item: DeletePermissionItemInput = job.params;
      return JSON.stringify(sortObjectKeys(item));
    },
    item => JSON.stringify(sortObjectKeys(item))
  );
});

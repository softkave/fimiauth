import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertCollaboratorListForTest} from '../../testUtils/generate/collaborator.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import countWorkspaceCollaborators from './handler.js';
import {CountWorkspaceCollaboratorsEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('countWorkspaceCollaborators', () => {
  test('count', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const seedCount = 15;
    await generateAndInsertCollaboratorListForTest(seedCount, () => ({
      workspaceId: workspace.resourceId,
    }));
    const count = await kSemanticModels.assignedItem().countByQuery({
      workspaceId: workspace.resourceId,
      assignedItemId: workspace.resourceId,
    });
    expect(count).toBeGreaterThanOrEqual(seedCount);

    const reqData =
      RequestData.fromExpressRequest<CountWorkspaceCollaboratorsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await countWorkspaceCollaborators(reqData);
    assertEndpointResultOk(result);
    expect(result.count).toBe(count);
  });
});

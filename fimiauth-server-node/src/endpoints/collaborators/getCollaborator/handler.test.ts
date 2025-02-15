import {afterAll, beforeAll, expect, test} from 'vitest';
import RequestData from '../../RequestData.js';
import {generateAndInsertCollaboratorListForTest} from '../../testUtils/generate/collaborator.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import {collaboratorExtractor} from '../utils.js';
import getCollaborator from './handler.js';
import {GetCollaboratorEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('collaborator returned', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const [collaborator] = await generateAndInsertCollaboratorListForTest(
    1,
    () => ({
      workspaceId: workspace.resourceId,
    })
  );

  const reqData = RequestData.fromExpressRequest<GetCollaboratorEndpointParams>(
    mockExpressRequestWithAgentToken(agentToken),
    {workspaceId: workspace.resourceId, collaboratorId: collaborator.resourceId}
  );
  const result = await getCollaborator(reqData);
  assertEndpointResultOk(result);

  expect(result.collaborator).toMatchObject(
    collaboratorExtractor(collaborator)
  );
});

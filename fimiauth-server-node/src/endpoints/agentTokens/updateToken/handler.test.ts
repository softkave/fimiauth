import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import EndpointReusableQueries from '../../queries.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertAgentTokenForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import {agentTokenExtractor, getPublicAgentToken} from '../utils.js';
import updateAgentToken from './handler.js';
import {
  UpdateAgentTokenEndpointParams,
  UpdateAgentTokenInput,
} from './types.js';

/**
 * TODO:
 * - [Low] Test that hanlder fails if permissionGroups doesn't exist
 * - [Low] Test that onReferenced feature works
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('agent token updated', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const {token: token01} = await insertAgentTokenForTest(
    agentToken,
    workspace.resourceId
  );
  const tokenUpdateInput: UpdateAgentTokenInput = {
    name: faker.lorem.words(10),
    description: faker.lorem.words(10),
  };

  const reqData =
    RequestData.fromExpressRequest<UpdateAgentTokenEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {
        tokenId: token01.resourceId,
        token: tokenUpdateInput,
        workspaceId: workspace.resourceId,
      }
    );
  const result = await updateAgentToken(reqData);
  assertEndpointResultOk(result);

  const updatedToken = await getPublicAgentToken(
    await kSemanticModels
      .agentToken()
      .assertGetOneByQuery(
        EndpointReusableQueries.getByResourceId(token01.resourceId)
      ),
    /** shouldEncode */ false
  );
  expect(agentTokenExtractor(updatedToken)).toMatchObject(result.token);
  expect(updatedToken.name).toBe(tokenUpdateInput.name);
  expect(updatedToken.description).toBe(tokenUpdateInput.description);
});

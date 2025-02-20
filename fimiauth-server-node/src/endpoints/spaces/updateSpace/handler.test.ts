import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import EndpointReusableQueries from '../../queries.js';
import RequestData from '../../RequestData.js';
import {
  UpdateSpaceEndpointParams,
  UpdateSpaceInput,
} from '../../spaces/updateSpace/types.js';
import {spaceExtractor} from '../../spaces/utils.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertSpaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import updateSpace from './handler.js';

/**
 * TODO:
 * - [Low] Test that hanlder fails if assigned spaces doesn't exist
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('space updated', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const {space: space00} = await insertSpaceForTest({
    agentToken,
    workspaceId: workspace.resourceId,
  });
  await insertSpaceForTest({
    agentToken,
    workspaceId: workspace.resourceId,
  });
  await insertSpaceForTest({
    agentToken,
    workspaceId: workspace.resourceId,
  });

  const updateSpaceInput: UpdateSpaceInput = {
    name: faker.lorem.words(2),
    description: faker.lorem.words(10),
  };
  const reqData = RequestData.fromExpressRequest<UpdateSpaceEndpointParams>(
    mockExpressRequestWithAgentToken(agentToken),
    {
      spaceId: space00.resourceId,
      data: updateSpaceInput,
    }
  );

  const result = await updateSpace(reqData);
  assertEndpointResultOk(result);

  const updatedSpace = await kSemanticModels
    .space()
    .assertGetOneByQuery(
      EndpointReusableQueries.getByResourceId(space00.resourceId)
    );

  expect(spaceExtractor(updatedSpace)).toMatchObject(result.space);
  expect(updatedSpace.name).toEqual(updateSpaceInput.name);
  expect(updatedSpace.description).toEqual(updateSpaceInput.description);
});

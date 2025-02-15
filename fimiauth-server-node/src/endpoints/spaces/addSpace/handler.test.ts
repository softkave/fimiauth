import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import EndpointReusableQueries from '../../queries.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  generateWorkspaceAndSessionAgent,
  initTests,
  insertSpaceForTest,
} from '../../testUtils/testUtils.js';
import {spaceExtractor} from '../utils.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('addSpace', () => {
  test('space permissions group added', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {space} = await insertSpaceForTest({
      agentToken,
      workspaceId: workspace.resourceId,
    });
    const savedSpace = await kSemanticModels
      .space()
      .assertGetOneByQuery(
        EndpointReusableQueries.getByResourceId(space.resourceId)
      );
    expect(spaceExtractor(savedSpace)).toMatchObject(space);
  });
});

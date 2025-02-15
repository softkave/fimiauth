import {
  calculatePageSize,
  indexArray,
  sortStringListLexicographically,
} from 'softkave-js-utils';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import RequestData from '../../RequestData.js';
import AssignedItemQueries from '../../assignedItems/queries.js';
import {generateAndInsertCollaboratorListForTest} from '../../testUtils/generate/collaborator.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import getWorkspaceCollaborators from './handler.js';
import {GetWorkspaceCollaboratorsEndpointParams} from './types.js';

/**
 * TODO:
 * - Check that only permitted collaborators are returned
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('getWorkspaceCollaborators', () => {
  test('workspace collaborators returned', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const collaborators = await generateAndInsertCollaboratorListForTest(
      15,
      () => ({
        workspaceId: workspace.resourceId,
      })
    );

    const reqData =
      RequestData.fromExpressRequest<GetWorkspaceCollaboratorsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {workspaceId: workspace.resourceId}
      );
    const result = await getWorkspaceCollaborators(reqData);
    assertEndpointResultOk(result);

    expect(result.collaborators.map(c => c.resourceId)).toEqual(
      collaborators.map(c => c.resourceId)
    );
  });

  test('pagination', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const seedCount = 15;
    const seedUsers = await generateAndInsertCollaboratorListForTest(
      seedCount,
      () => ({
        workspaceId: workspace.resourceId,
      })
    );
    const count = await kSemanticModels
      .assignedItem()
      .countByQuery(
        AssignedItemQueries.getByAssignedItem(
          workspace.resourceId,
          workspace.resourceId
        )
      );
    expect(count).toBeGreaterThanOrEqual(seedCount);

    const pageSize = 10;
    let page = 0;
    let reqData =
      RequestData.fromExpressRequest<GetWorkspaceCollaboratorsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {pageSize, workspaceId: workspace.resourceId}
      );
    let result = await getWorkspaceCollaborators(reqData);
    assertEndpointResultOk(result);
    let fetchedUsers = result.collaborators;

    expect(result.page).toBe(page);
    expect(result.collaborators).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );

    page = 1;
    reqData =
      RequestData.fromExpressRequest<GetWorkspaceCollaboratorsEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {page, pageSize, workspaceId: workspace.resourceId}
      );
    result = await getWorkspaceCollaborators(reqData);
    assertEndpointResultOk(result);
    fetchedUsers = fetchedUsers.concat(result.collaborators);

    const fetchedUsersMap = indexArray(fetchedUsers, {
      indexer: nextUser => nextUser.resourceId,
    });
    const seedUsersMap = indexArray(seedUsers, {
      indexer: seedUser => seedUser.resourceId,
    });
    expect(
      sortStringListLexicographically(Object.keys(fetchedUsersMap))
    ).toEqual(sortStringListLexicographically(Object.keys(seedUsersMap)));
    seedUsers.forEach(seedUser => {
      expect(fetchedUsersMap[seedUser.resourceId]).toBeTruthy();
    });
    fetchedUsers.forEach(fetchedUser => {
      expect(seedUsersMap[fetchedUser.resourceId]).toBeTruthy();
    });

    expect(result.page).toBe(page);
    expect(result.collaborators).toHaveLength(
      calculatePageSize(count, pageSize, page)
    );
  });
});

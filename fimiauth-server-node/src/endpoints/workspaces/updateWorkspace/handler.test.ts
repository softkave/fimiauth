import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import EndpointReusableQueries from '../../queries.js';
import RequestData from '../../RequestData.js';
import {expectErrorThrown} from '../../testUtils/helpers/error.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertWorkspaceForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import updateWorkspace from './handler.js';
import {UpdateWorkspaceEndpointParams, UpdateWorkspaceInput} from './types.js';
import {ResourceExistsError} from '../../errors.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('updateWorkspce', () => {
  test('workspace updated', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const companyName = faker.company.name();
    const workspaceUpdateInput: Partial<UpdateWorkspaceInput> = {
      name: companyName,
      // rootname: makeRootnameFromName(companyName),
      description: faker.company.catchPhraseDescriptor(),
      // usageThresholds: generateTestUsageThresholdInputMap(500),
    };

    const reqData =
      RequestData.fromExpressRequest<UpdateWorkspaceEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          workspace: workspaceUpdateInput,
        }
      );

    const result = await updateWorkspace(reqData);
    assertEndpointResultOk(result);
    expect(result.workspace).toMatchObject(workspaceUpdateInput);
    const updatedWorkspace = await kSemanticModels
      .workspace()
      .getOneByQuery(
        EndpointReusableQueries.getByResourceId(workspace.resourceId)
      );
    expect(updatedWorkspace).toMatchObject(workspaceUpdateInput);
  });

  test('fails if workspace name exists', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const {workspace: w02} = await insertWorkspaceForTest(agentToken);
    await expectErrorThrown(async () => {
      const reqData =
        RequestData.fromExpressRequest<UpdateWorkspaceEndpointParams>(
          mockExpressRequestWithAgentToken(agentToken),
          {workspaceId: workspace.resourceId, workspace: {name: w02.name}}
        );

      await updateWorkspace(reqData);
    }, [ResourceExistsError.name]);
  });
});

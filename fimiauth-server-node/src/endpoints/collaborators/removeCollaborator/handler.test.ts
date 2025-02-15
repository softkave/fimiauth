import {afterAll, beforeAll, describe, expect, test} from 'vitest';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {
  DeleteResourceJobParams,
  Job,
  kJobType,
} from '../../../definitions/job.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {appAssert} from '../../../utils/assertion.js';
import RequestData from '../../RequestData.js';
import {generateAndInsertCollaboratorListForTest} from '../../testUtils/generate/collaborator.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import removeCollaborator from './handler.js';
import {RemoveCollaboratorEndpointParams} from './types.js';

/**
 * TODO:
 * - test user does not have access to workspace when job is done
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('removeCollaborator', () => {
  test('collaborator removed', async () => {
    const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
    const [collaborator] = await generateAndInsertCollaboratorListForTest(
      1,
      () => ({
        workspaceId: workspace.resourceId,
      })
    );

    const reqData =
      RequestData.fromExpressRequest<RemoveCollaboratorEndpointParams>(
        mockExpressRequestWithAgentToken(agentToken),
        {
          workspaceId: workspace.resourceId,
          collaboratorId: collaborator.resourceId,
        }
      );

    const result = await removeCollaborator(reqData);
    assertEndpointResultOk(result);

    appAssert(result.jobId);
    const job = (await kSemanticModels.job().getOneByQuery({
      type: kJobType.deleteResource,
      resourceId: result.jobId,
      params: {
        $objMatch: {
          type: kFimidaraResourceType.Collaborator,
        },
      },
    })) as Job<DeleteResourceJobParams>;
    expect(job).toBeTruthy();
    expect(job?.params).toMatchObject({
      resourceId: collaborator.resourceId,
      workspaceId: workspace.resourceId,
    });
  });
});

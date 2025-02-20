import {faker} from '@faker-js/faker';
import {afterAll, beforeAll, expect, test} from 'vitest';
import {DataQuery} from '../../../contexts/data/types.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kCollaborationRequestStatusTypeMap} from '../../../definitions/collaborationRequest.js';
import {
  EmailJobParams,
  Job,
  kEmailJobType,
  kJobType,
} from '../../../definitions/job.js';
import EndpointReusableQueries from '../../queries.js';
import RequestData from '../../RequestData.js';
import {completeTests} from '../../testUtils/helpers/testFns.js';
import {
  assertEndpointResultOk,
  generateWorkspaceAndSessionAgent,
  initTests,
  insertRequestForTest,
  mockExpressRequestWithAgentToken,
} from '../../testUtils/testUtils.js';
import {collaborationRequestForUserExtractor} from '../utils.js';
import respondToCollaborationRequest from './handler.js';
import {RespondToCollaborationRequestEndpointParams} from './types.js';

/**
 * TODO:
 * - Check if user declined, the update is "declined"
 */

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('collaboration request declined', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const email = faker.internet.email();
  const {request: request01} = await insertRequestForTest(
    agentToken,
    workspace.resourceId,
    {recipientEmail: email}
  );

  const reqData =
    RequestData.fromExpressRequest<RespondToCollaborationRequestEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {
        requestId: request01.resourceId,
        response: kCollaborationRequestStatusTypeMap.Accepted,
      }
    );
  const result = await respondToCollaborationRequest(reqData);
  assertEndpointResultOk(result);
  const updatedRequest = await kSemanticModels
    .collaborationRequest()
    .assertGetOneByQuery(
      EndpointReusableQueries.getByResourceId(request01.resourceId)
    );

  expect(result.request.resourceId).toEqual(request01.resourceId);
  expect(result.request).toMatchObject(
    collaborationRequestForUserExtractor(updatedRequest)
  );
  expect(updatedRequest.status).toBe(
    kCollaborationRequestStatusTypeMap.Accepted
  );

  await kUtilsInjectables.promises().flush();
  // const query: DataQuery<EmailMessage<CollaborationRequestEmailMessageParams>> = {
  //   type: kEmailJobType.collaborationRequestResponse,
  //   emailAddress: {$all: [user.email]},
  //   userId: {$all: [user.resourceId]},
  //   params: {$objMatch: {requestId: request01.resourceId}},
  // };
  // const dbEmailMessage = await kSemanticModels.emailMessage().getOneByQuery(query);
  // expect(dbEmailMessage).toBeTruthy();

  const query: DataQuery<Job<EmailJobParams>> = {
    type: kJobType.email,
    params: {
      $objMatch: {
        type: kEmailJobType.collaborationRequestResponse,
        emailAddress: {$all: [email]},
        params: {$objMatch: {requestId: request01.resourceId}},
      },
    },
  };
  const dbJob = await kSemanticModels.job().getOneByQuery(query);
  expect(dbJob).toBeTruthy();
});

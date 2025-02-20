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
import revokeCollaborationRequest from './handler.js';
import {RevokeCollaborationRequestEndpointParams} from './types.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

test('collaboration request revoked', async () => {
  const {workspace, agentToken} = await generateWorkspaceAndSessionAgent();
  const email = faker.internet.email();
  const {request: request01} = await insertRequestForTest(
    agentToken,
    workspace.resourceId,
    {recipientEmail: email}
  );
  const reqData =
    RequestData.fromExpressRequest<RevokeCollaborationRequestEndpointParams>(
      mockExpressRequestWithAgentToken(agentToken),
      {requestId: request01.resourceId}
    );
  const result = await revokeCollaborationRequest(reqData);
  assertEndpointResultOk(result);

  const updatedRequest = await kSemanticModels
    .collaborationRequest()
    .assertGetOneByQuery({resourceId: request01.resourceId});
  expect(result.request.resourceId).toEqual(request01.resourceId);
  expect(result.request).toMatchObject(
    collaborationRequestForUserExtractor(updatedRequest)
  );
  expect(updatedRequest.status).toBe(
    kCollaborationRequestStatusTypeMap.Revoked
  );

  await kUtilsInjectables.promises().flush();
  // const query: DataQuery<EmailMessage<CollaborationRequestEmailMessageParams>> = {
  //   type: kEmailMessageType.collaborationRequestRevoked,
  //   emailAddress: {$all: [user02.email]},
  //   params: {$objMatch: {requestId: request01.resourceId}},
  // };
  // const dbEmailMessage = await kSemanticModels.emailMessage().getOneByQuery(query);
  // expect(dbEmailMessage).toBeTruthy();

  const query: DataQuery<Job<EmailJobParams>> = {
    type: kJobType.email,
    params: {
      $objMatch: {
        type: kEmailJobType.collaborationRequestRevoked,
        emailAddress: {$all: [email]},
        params: {$objMatch: {requestId: request01.resourceId}},
      },
    },
  };
  const dbJob = await kSemanticModels.job().getOneByQuery(query);
  expect(dbJob).toBeTruthy();
});

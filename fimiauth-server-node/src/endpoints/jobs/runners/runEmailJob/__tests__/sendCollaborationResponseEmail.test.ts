import {afterAll, beforeAll, describe, expect, test} from 'vitest';

import {faker} from '@faker-js/faker';
import {IEmailProviderContext} from '../../../../../contexts/email/types.js';
import {kUtilsInjectables} from '../../../../../contexts/injection/injectables.js';
import {kRegisterUtilsInjectables} from '../../../../../contexts/injection/register.js';
import {
  CollaborationRequestResponse,
  kCollaborationRequestStatusTypeMap,
} from '../../../../../definitions/collaborationRequest.js';
import {kEmailJobType} from '../../../../../definitions/job.js';
import {kFimidaraResourceType} from '../../../../../definitions/system.js';
import {kCollaborationRequestResponseArtifacts} from '../../../../../emailTemplates/collaborationRequestResponse.js';
import {getNewIdForResource} from '../../../../../utils/resource.js';
import MockTestEmailProviderContext from '../../../../testUtils/context/email/MockTestEmailProviderContext.js';
import {generateAndInsertCollaborationRequestListForTest} from '../../../../testUtils/generate/collaborationRequest.js';
import {generateAndInsertWorkspaceListForTest} from '../../../../testUtils/generate/workspace.js';
import {completeTests} from '../../../../testUtils/helpers/testFns.js';
import {initTests} from '../../../../testUtils/testUtils.js';
import {sendCollaborationRequestResponseEmail} from '../sendCollaborationRequestResponseEmail.js';

beforeAll(async () => {
  await initTests();
});

afterAll(async () => {
  await completeTests();
});

describe('sendCollaborationRequestResponseEmail', () => {
  test('sendEmail called', async () => {
    const email = faker.internet.email();
    const [[workspace]] = await Promise.all([
      generateAndInsertWorkspaceListForTest(1),
    ]);
    const [request] = await generateAndInsertCollaborationRequestListForTest(
      1,
      () => ({
        recipientEmail: email,
        workspaceId: workspace.resourceId,
        workspaceName: workspace.name,
        status: kCollaborationRequestStatusTypeMap.Accepted,
      })
    );
    const testEmailProvider = new MockTestEmailProviderContext();
    kRegisterUtilsInjectables.email(testEmailProvider);

    await sendCollaborationRequestResponseEmail(
      getNewIdForResource(kFimidaraResourceType.Job),
      {
        emailAddress: [email],
        userId: [],
        type: kEmailJobType.collaborationRequestResponse,
        params: {requestId: request.resourceId},
      }
    );

    const call = testEmailProvider.sendEmail.mock.lastCall as Parameters<
      IEmailProviderContext['sendEmail']
    >;
    const params = call[0];
    expect(params.body.html).toBeTruthy();
    expect(params.body.text).toBeTruthy();
    expect(params.destination).toEqual([email]);
    expect(params.subject).toBe(
      kCollaborationRequestResponseArtifacts.title({
        response: request.status as CollaborationRequestResponse,
        workspaceName: workspace.name,
      })
    );
    expect(params.source).toBe(
      kUtilsInjectables.suppliedConfig().senderEmailAddress
    );
  });
});

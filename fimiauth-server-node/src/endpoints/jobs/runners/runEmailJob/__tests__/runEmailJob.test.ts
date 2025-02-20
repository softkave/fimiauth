import {afterAll, beforeAll, describe, expect, test} from 'vitest';

import {faker} from '@faker-js/faker';
import {
  EmailProviderSendEmailResult,
  IEmailProviderContext,
  SendEmailParams,
} from '../../../../../contexts/email/types.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../../../contexts/injection/injectables.js';
import {kRegisterUtilsInjectables} from '../../../../../contexts/injection/register.js';
import {
  kEmailBlocklistReason,
  kEmailBlocklistTrailType,
} from '../../../../../definitions/email.js';
import {
  EmailJobParams,
  kEmailJobType,
  kJobType,
} from '../../../../../definitions/job.js';
import {kFimidaraConfigEmailProvider} from '../../../../../resources/config.js';
import {kSystemSessionAgent} from '../../../../../utils/agent.js';
import {generateAndInsertCollaborationRequestListForTest} from '../../../../testUtils/generate/collaborationRequest.js';
import {generateAndInsertWorkspaceListForTest} from '../../../../testUtils/generate/workspace.js';
import {completeTests} from '../../../../testUtils/helpers/testFns.js';
import {initTests} from '../../../../testUtils/testUtils.js';
import {queueJobs} from '../../../queueJobs.js';
import {runEmailJob} from '../runEmailJob.js';

beforeAll(async () => {
  await initTests();
  kRegisterUtilsInjectables.email(new TestEmailProviderContext());
});

afterAll(async () => {
  await completeTests();
});

describe('runEmailJob', () => {
  test('updates blocklist', async () => {
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
      })
    );
    const [job] = await queueJobs<EmailJobParams>({
      workspaceId: workspace.resourceId,
      spaceId: workspace.spaceId,
      parentJobId: undefined,
      jobsInput: [
        {
          createdBy: kSystemSessionAgent,
          type: kJobType.email,
          params: {
            emailAddress: [email],
            userId: [],
            type: kEmailJobType.collaborationRequestResponse,
            params: {requestId: request.resourceId},
          },
          idempotencyToken: Date.now().toString(),
        },
      ],
    });

    await runEmailJob(job);
    await kUtilsInjectables.promises().flush();

    const blocklistItem = await kSemanticModels.emailBlocklist().getOneByQuery({
      emailAddress: email,
      reason: kEmailBlocklistReason.bounce,
      trail: {
        $objMatch: {
          jobId: job.resourceId,
          trailType: kEmailBlocklistTrailType.emailJob,
        },
      },
    });
    expect(blocklistItem).toBeTruthy();
  });

  test('updates job meta', async () => {
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
      })
    );
    const [job] = await queueJobs<EmailJobParams>({
      workspaceId: workspace.resourceId,
      spaceId: workspace.spaceId,
      parentJobId: undefined,
      jobsInput: [
        {
          createdBy: kSystemSessionAgent,
          type: kJobType.email,
          params: {
            emailAddress: [email],
            userId: [],
            type: kEmailJobType.collaborationRequestResponse,
            params: {requestId: request.resourceId},
          },
          idempotencyToken: Date.now().toString(),
        },
      ],
    });

    await runEmailJob(job);
    await kUtilsInjectables.promises().flush();

    const dbJob = await kSemanticModels
      .job()
      .getOneByQuery({resourceId: job.resourceId});
    expect(dbJob?.meta).toMatchObject({
      emailProvider: kFimidaraConfigEmailProvider.noop,
      other: {},
    });
  });
});

class TestEmailProviderContext implements IEmailProviderContext {
  sendEmail = async (
    params: SendEmailParams
  ): Promise<EmailProviderSendEmailResult> => {
    return {
      blockEmailAddressList: params.destination.map(emailAddress => ({
        emailAddress,
        reason: kEmailBlocklistReason.bounce,
      })),
      meta: {emailProvider: kFimidaraConfigEmailProvider.noop, other: {}},
    };
  };
}

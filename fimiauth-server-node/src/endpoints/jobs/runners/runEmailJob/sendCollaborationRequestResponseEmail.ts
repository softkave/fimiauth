import {first} from 'lodash-es';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../../contexts/injection/injectables.js';
import {CollaborationRequestResponse} from '../../../../definitions/collaborationRequest.js';
import {EmailJobParams, kEmailJobType} from '../../../../definitions/job.js';
import {
  CollaborationRequestResponseEmailProps,
  collaborationRequestResponseEmailHTML,
  collaborationRequestResponseEmailText,
  kCollaborationRequestResponseArtifacts,
} from '../../../../emailTemplates/collaborationRequestResponse.js';
import {appAssert} from '../../../../utils/assertion.js';
import {getBaseEmailTemplateProps} from './utils.js';

export async function sendCollaborationRequestResponseEmail(
  jobId: string,
  params: EmailJobParams
) {
  appAssert(
    params.type === kEmailJobType.collaborationRequestResponse,
    `Email job type is not ${kEmailJobType.collaborationRequestResponse}`
  );
  const [{base, source}, request] = await Promise.all([
    getBaseEmailTemplateProps(params),
    kSemanticModels.collaborationRequest().getOneById(params.params.requestId),
  ]);

  if (!request) {
    throw new Error(`Collaboration request not found for job ${jobId}`);
  }

  const workspace = await kSemanticModels
    .workspace()
    .getOneById(request.workspaceId);

  if (!workspace) {
    throw new Error(`Workspace not found for job ${jobId}`);
  }

  const emailAddress = first(params.emailAddress);
  if (!emailAddress) {
    throw new Error(`Email address not found for job ${jobId}`);
  }

  const emailProps: CollaborationRequestResponseEmailProps = {
    ...base,
    recipientEmail: emailAddress,
    response: request.status as CollaborationRequestResponse,
    workspaceName: workspace.name,
  };
  const html = collaborationRequestResponseEmailHTML(emailProps);
  const text = collaborationRequestResponseEmailText(emailProps);
  return await kUtilsInjectables.email().sendEmail({
    source,
    subject: kCollaborationRequestResponseArtifacts.title(emailProps),
    body: {html, text},
    destination: params.emailAddress,
  });
}

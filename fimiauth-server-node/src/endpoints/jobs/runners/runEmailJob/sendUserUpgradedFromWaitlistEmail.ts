import {first} from 'lodash-es';
import {kUtilsInjectables} from '../../../../contexts/injection/injectables.js';
import {EmailJobParams, kEmailJobType} from '../../../../definitions/job.js';
import {
  UpgradedFromWaitlistEmailProps,
  kUpgradeFromWaitlistEmailArtifacts,
  upgradedFromWaitlistEmailHTML,
  upgradedFromWaitlistEmailText,
} from '../../../../emailTemplates/upgradedFromWaitlist.js';
import {appAssert} from '../../../../utils/assertion.js';
import {getBaseEmailTemplateProps} from './utils.js';

export async function sendUserUpgradedFromWaitlistEmail(
  jobId: string,
  params: EmailJobParams
) {
  appAssert(
    params.type === kEmailJobType.upgradedFromWaitlist,
    `Email job type is not ${kEmailJobType.upgradedFromWaitlist}`
  );
  const {base, source} = await getBaseEmailTemplateProps(params);
  const emailAddress = first(params.emailAddress);
  if (!emailAddress) {
    throw new Error(`Email address not found for job ${jobId}`);
  }

  const emailProps: UpgradedFromWaitlistEmailProps = {
    ...base,
  };
  const html = upgradedFromWaitlistEmailHTML(emailProps);
  const text = upgradedFromWaitlistEmailText(emailProps);
  return await kUtilsInjectables.email().sendEmail({
    source,
    subject: kUpgradeFromWaitlistEmailArtifacts.title,
    body: {html, text},
    destination: params.emailAddress,
  });
}

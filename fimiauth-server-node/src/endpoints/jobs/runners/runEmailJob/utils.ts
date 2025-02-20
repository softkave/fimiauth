import {kUtilsInjectables} from '../../../../contexts/injection/injectables.js';
import {EmailJobParams} from '../../../../definitions/job.js';
import {BaseEmailTemplateProps} from '../../../../emailTemplates/types.js';
import {appAssert} from '../../../../utils/assertion.js';

export async function getBaseEmailTemplateProps(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: EmailJobParams
): Promise<{
  base: BaseEmailTemplateProps;
  source: string;
}> {
  const suppliedConfig = kUtilsInjectables.suppliedConfig();

  appAssert(
    suppliedConfig.clientLoginLink,
    'clientLoginLink not present in config'
  );
  appAssert(
    suppliedConfig.clientSignupLink,
    'clientSignupLink not present in config'
  );
  appAssert(
    suppliedConfig.senderEmailAddress,
    'senderEmailAddress not present in config'
  );

  return {
    source: suppliedConfig.senderEmailAddress,
    base: {},
  };
}

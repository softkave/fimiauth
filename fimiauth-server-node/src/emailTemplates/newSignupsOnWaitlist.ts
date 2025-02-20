import {
  emailHelperChars,
  emailStylingHelpers,
  emailTemplateStyles,
  getFooterHTML,
  getGreetingHTML,
  getGreetingText,
  getHeaderHTML,
  getHeaderText,
} from './helpers.js';
import {BaseEmailTemplateProps} from './types.js';

export const kNewSignupsOnWaitlistEmailArtifacts = {
  title: (count: number) =>
    `There are ${count} new signup${count === 1 ? '' : 's'} on waitlist`,
  message: (count: number) =>
    `There are ${count} new signup${
      count === 1 ? '' : 's'
    } on waitlist, click below OR visit /internals to upgrade them.`,
};

export interface NewSignupsOnWaitlistEmailProps extends BaseEmailTemplateProps {
  count: number;
}

export function newSignupsOnWaitlistEmailHTML(
  props: NewSignupsOnWaitlistEmailProps
): string {
  return `
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8" />
  <title>${getHeaderText(
    kNewSignupsOnWaitlistEmailArtifacts.title(props.count)
  )}</title>
  ${emailTemplateStyles}
</head>
<body>
  ${getHeaderHTML(kNewSignupsOnWaitlistEmailArtifacts.title(props.count))}
  <div class="${emailStylingHelpers.classNamePrefix}-body">
    <div class="${emailStylingHelpers.classNamePrefix}-content-center">
      ${getGreetingHTML(props)}
      <p>${kNewSignupsOnWaitlistEmailArtifacts.message(props.count)}</p>
    </div>
  </div>
  ${getFooterHTML()}
</body>
</html>
  `;
}

export function newSignupsOnWaitlistEmailText(
  props: NewSignupsOnWaitlistEmailProps
): string {
  const text = `${getHeaderText(
    kNewSignupsOnWaitlistEmailArtifacts.title(props.count)
  )}
${emailHelperChars.emDash}
${getGreetingText(props)}
${kNewSignupsOnWaitlistEmailArtifacts.message(props.count)}
`;

  return text;
}

import {formatDateTime} from '../utils/dateFns.js';
import {
  emailHelperChars,
  emailTemplateStyles,
  getCenteredContentHTML,
  getFooterHTML,
  getGreetingHTML,
  getGreetingText,
  getHeaderHTML,
  getHeaderText,
} from './helpers.js';
import {BaseEmailTemplateProps} from './types.js';

export interface CollaborationRequestEmailProps extends BaseEmailTemplateProps {
  workspaceName: string;
  message?: string;
  expires?: number;
}

export const kCollaborationRequestEmailArtifacts = {
  title: (workspaceName: string) => {
    return `Collaboration request from ${workspaceName}`;
  },
};

export function collaborationRequestEmailHTML(
  props: CollaborationRequestEmailProps
) {
  const title = kCollaborationRequestEmailArtifacts.title(props.workspaceName);
  return `
<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8" />
  <title>${getHeaderText(title)}</title>
  ${emailTemplateStyles}
</head>
<body>
  ${getHeaderHTML(title)}
  ${getCenteredContentHTML(`
    ${getGreetingHTML(props)}
    <p>
      You have a new collaboration request from <b>${props.workspaceName}</b>.
    </p>
    ${props.message ? `<p>Message: <br />${props.message}</p>` : ''}
    ${
      props.expires
        ? `<p>Expires: <br />${formatDateTime(props.expires)}</p>`
        : ''
    }
    `)}
  ${getFooterHTML()}
</body>
</html>
    `;
}

export function collaborationRequestEmailText(
  props: CollaborationRequestEmailProps
) {
  const title = kCollaborationRequestEmailArtifacts.title(props.workspaceName);

  const txt = `${getHeaderText(title)}
${emailHelperChars.emDash}
${getGreetingText(props)}
You have a new collaboration request from ${props.workspaceName}.
${props.message ? `Message: ${props.message}` : ''}
${props.expires ? `Expires: ${formatDateTime(props.expires)}` : ''}
  `;

  return txt;
}

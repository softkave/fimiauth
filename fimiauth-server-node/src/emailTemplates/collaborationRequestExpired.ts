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

export interface CollaborationRequestExpiredEmailProps
  extends BaseEmailTemplateProps {
  workspaceName: string;
}

export const kCollaborationRequestExpiredArtifacts = {
  title: (props: CollaborationRequestExpiredEmailProps) => {
    return `Collaboration request from ${props.workspaceName} expired`;
  },
};

export function collaborationRequestExpiredEmailHTML(
  props: CollaborationRequestExpiredEmailProps
) {
  const title = kCollaborationRequestExpiredArtifacts.title(props);
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
      This is to notify you that the collaboration request sent from ${
        props.workspaceName
      } has been expired.
    </p>`)}
  ${getFooterHTML()}
</body>
</html>
`;
}

export function collaborationRequestExpiredEmailText(
  props: CollaborationRequestExpiredEmailProps
) {
  const title = kCollaborationRequestExpiredArtifacts.title(props);
  const txt = `${getHeaderText(title)}
${emailHelperChars.emDash}
${getGreetingText(props)}
This is to notify you that the collaboration request sent from ${
    props.workspaceName
  } has been expired.
`;

  return txt;
}

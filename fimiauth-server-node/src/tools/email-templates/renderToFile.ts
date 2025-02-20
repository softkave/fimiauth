import {faker} from '@faker-js/faker';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import {kCollaborationRequestStatusTypeMap} from '../../definitions/collaborationRequest.js';
import {
  CollaborationRequestEmailProps,
  collaborationRequestEmailHTML,
  collaborationRequestEmailText,
} from '../../emailTemplates/collaborationRequest.js';
import {
  CollaborationRequestResponseEmailProps,
  collaborationRequestResponseEmailHTML,
  collaborationRequestResponseEmailText,
} from '../../emailTemplates/collaborationRequestResponse.js';
import {
  CollaborationRequestRevokedEmailProps,
  collaborationRequestRevokedEmailHTML,
  collaborationRequestRevokedEmailText,
} from '../../emailTemplates/collaborationRequestRevoked.js';
import {
  NewSignupsOnWaitlistEmailProps,
  newSignupsOnWaitlistEmailHTML,
  newSignupsOnWaitlistEmailText,
} from '../../emailTemplates/newSignupsOnWaitlist.js';
import {
  UpgradedFromWaitlistEmailProps,
  upgradedFromWaitlistEmailHTML,
  upgradedFromWaitlistEmailText,
} from '../../emailTemplates/upgradedFromWaitlist.js';
import {getTimestamp} from '../../utils/dateFns.js';

const basepath = './src/tools/email-templates/templates/';

async function writeToFile(filename: string, htmlText: string, text: string) {
  const htmlFilepath = `${basepath}${filename}.html`;
  const textFilepath = `${basepath}${filename}.txt`;

  await Promise.all([
    fse.ensureFile(htmlFilepath),
    fse.ensureFile(textFilepath),
  ]);

  await Promise.all([
    fs.promises.writeFile(htmlFilepath, htmlText),
    fs.promises.writeFile(textFilepath, text),
  ]);
}

// Collaboration request email
export async function renderCollaborationRequestMedia() {
  const props: CollaborationRequestEmailProps = {
    workspaceName: 'Fimidara',
    expires: getTimestamp(),
    message:
      'Test collaboration request message. ' +
      'Not too long, and not too short',
    firstName: 'Abayomi',
  };

  const renderedHTML = collaborationRequestEmailHTML(props);
  const renderedText = collaborationRequestEmailText(props);
  await writeToFile('collaborationRequest', renderedHTML, renderedText);
}

// Collaboration request revoked email
export async function renderCollaborationRequestRevokedMedia() {
  const props: CollaborationRequestRevokedEmailProps = {
    workspaceName: 'Fimidara',
    firstName: 'Abayomi',
  };

  const renderedHTML = collaborationRequestRevokedEmailHTML(props);
  const renderedText = collaborationRequestRevokedEmailText(props);
  await writeToFile('collaborationRequestRevoked', renderedHTML, renderedText);
}

// Collaboration request response email
export async function renderCollaborationRequestResponseMedia() {
  const props: CollaborationRequestResponseEmailProps = {
    workspaceName: 'Fimidara',
    recipientEmail: faker.internet.email(),
    response: kCollaborationRequestStatusTypeMap.Accepted,
    firstName: 'Abayomi',
  };

  const renderedHTML = collaborationRequestResponseEmailHTML(props);
  const renderedText = collaborationRequestResponseEmailText(props);
  await writeToFile('collaborationRequestResponse', renderedHTML, renderedText);
}

// Upgraded from waitlist
export async function renderUpgradedFromWaitlistMedia() {
  const props: UpgradedFromWaitlistEmailProps = {
    firstName: 'Abayomi',
  };

  const renderedHTML = upgradedFromWaitlistEmailHTML(props);
  const renderedText = upgradedFromWaitlistEmailText(props);
  await writeToFile('upgradedFromWaitlist', renderedHTML, renderedText);
}

// New  signups on waitlist
export async function renderNewSignupsOnWaitlistMedia() {
  const props: NewSignupsOnWaitlistEmailProps = {
    count: 5,
    firstName: 'Abayomi',
  };

  const renderedHTML = newSignupsOnWaitlistEmailHTML(props);
  const renderedText = newSignupsOnWaitlistEmailText(props);
  await writeToFile('newSignupsOnWaitlist', renderedHTML, renderedText);
}

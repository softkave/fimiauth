import {globalDispose} from '../../contexts/globalUtils.js';
import {kUtilsInjectables} from '../../contexts/injection/injectables.js';
import {registerUtilsInjectables} from '../../contexts/injection/register.js';
import {
  kFimidaraConfigDbType,
  kFimidaraConfigQueueProvider,
} from '../../resources/config.js';
import {
  renderCollaborationRequestMedia,
  renderCollaborationRequestResponseMedia,
  renderCollaborationRequestRevokedMedia,
  renderNewSignupsOnWaitlistMedia,
  renderUpgradedFromWaitlistMedia,
} from './renderToFile.js';

async function main() {
  await registerUtilsInjectables({
    dbType: kFimidaraConfigDbType.noop,
    queueProvider: kFimidaraConfigQueueProvider.memory,
    pubSubProvider: kFimidaraConfigQueueProvider.memory,
  });

  kUtilsInjectables.logger().log('Writing templates');

  await Promise.all([
    renderCollaborationRequestMedia(),
    renderCollaborationRequestRevokedMedia(),
    renderCollaborationRequestResponseMedia(),
    renderUpgradedFromWaitlistMedia(),
    renderNewSignupsOnWaitlistMedia(),
  ]);

  kUtilsInjectables.logger().log('Completed writing templates');
  await globalDispose();
}

main();

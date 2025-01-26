import {rm} from 'fs/promises';
import {getSuppliedConfig} from '../resources/config.js';
import {dropMongoCollections} from './utils.js';

export async function teardown() {
  const config = await getSuppliedConfig();
  const dropMongoPromise = dropMongoCollections(config);
  await Promise.all([
    dropMongoPromise,
    config.localFsDir && rm(config.localFsDir, {recursive: true, force: true}),
  ]);
}
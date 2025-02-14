import {Connection, Document, Model, Schema} from 'mongoose';
import {Space} from '../definitions/space.js';
import {ensureMongoTypeFields, workspaceResourceSchema} from './utils.js';

const spaceSchema = ensureMongoTypeFields<Space>({
  ...workspaceResourceSchema,
  name: {type: String, required: true, index: true},
  description: {type: String, required: false},
  publicPermissionGroupId: {type: String, index: true},
});

export type SpaceDocument = Document<Space>;

const schema = new Schema<Space>(spaceSchema);
const modelName = 'space';
const collectionName = 'spaces';

export function getSpaceModel(connection: Connection) {
  const model = connection.model<Space>(modelName, schema, collectionName);
  return model;
}

export type SpaceModel = Model<Space>;

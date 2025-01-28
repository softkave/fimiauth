import {Connection, Document, Model, Schema} from 'mongoose';
import {Workspace} from '../definitions/workspace.js';
import {ensureMongoTypeFields, workspaceResourceSchema} from './utils.js';

const workspaceSchema = ensureMongoTypeFields<Workspace>({
  ...workspaceResourceSchema,
  publicPermissionGroupId: {type: String},
  name: {type: String, index: true},
  description: {type: String},
});

export type WorkspaceDocument = Document<Workspace>;

const schema = new Schema<Workspace>(workspaceSchema);
const modelName = 'workspace';
const collectionName = 'workspaces';

export function getWorkspaceModel(connection: Connection) {
  const model = connection.model<Workspace>(modelName, schema, collectionName);
  return model;
}

export type WorkspaceModel = Model<Workspace>;

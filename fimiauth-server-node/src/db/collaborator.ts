import {Connection, Document, Model, Schema} from 'mongoose';
import {Collaborator} from '../definitions/collaborator.js';
import {ensureMongoTypeFields, workspaceResourceSchema} from './utils.js';

const collaboratorSchema = ensureMongoTypeFields<Collaborator>({
  ...workspaceResourceSchema,
  providedResourceId: {type: String, required: true, index: true},
});

export type CollaboratorDocument = Document<Collaborator>;

const schema = new Schema<Collaborator>(collaboratorSchema);
const modelName = 'collaborator';
const collectionName = 'collaborators';

export function getCollaboratorModel(connection: Connection) {
  const model = connection.model<Collaborator>(
    modelName,
    schema,
    collectionName
  );
  return model;
}

export type CollaboratorModel = Model<Collaborator>;

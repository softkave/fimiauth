import {ExportedHttpEndpointWithMddocDefinition} from '../types.js';
import {AddCollaboratorEndpoint} from './addCollaborator/types.js';
import {CountWorkspaceCollaboratorsEndpoint} from './countWorkspaceCollaborators/types.js';
import {GetCollaboratorEndpoint} from './getCollaborator/types.js';
import {GetWorkspaceCollaboratorsEndpoint} from './getWorkspaceCollaborators/types.js';
import {RemoveCollaboratorEndpoint} from './removeCollaborator/types.js';

export type AddCollaboratorHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<AddCollaboratorEndpoint>;
export type GetCollaboratorHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<GetCollaboratorEndpoint>;
export type GetWorkspaceCollaboratorsHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<GetWorkspaceCollaboratorsEndpoint>;
export type CountWorkspaceCollaboratorsHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<CountWorkspaceCollaboratorsEndpoint>;
export type RemoveCollaboratorHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<RemoveCollaboratorEndpoint>;

export type CollaboratorsExportedEndpoints = {
  addCollaborator: AddCollaboratorHttpEndpoint;
  getCollaborator: GetCollaboratorHttpEndpoint;
  getWorkspaceCollaborators: GetWorkspaceCollaboratorsHttpEndpoint;
  countWorkspaceCollaborators: CountWorkspaceCollaboratorsHttpEndpoint;
  removeCollaborator: RemoveCollaboratorHttpEndpoint;
};

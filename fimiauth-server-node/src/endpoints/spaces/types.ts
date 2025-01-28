import {ExportedHttpEndpointWithMddocDefinition} from '../types.js';
import {AddSpaceEndpoint} from './addSpace/types.js';
import {CountWorkspaceSpacesEndpoint} from './countWorkspaceSpaces/types.js';
import {DeleteSpaceEndpoint} from './deleteSpace/types.js';
import {GetSpaceEndpoint} from './getSpace/types.js';
import {GetWorkspaceSpacesEndpoint} from './getWorkspaceSpaces/types.js';
import {UpdateSpaceEndpoint} from './updateSpace/types.js';

export type AddSpaceHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<AddSpaceEndpoint>;
export type DeleteSpaceHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<DeleteSpaceEndpoint>;
export type GetWorkspaceSpacesHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<GetWorkspaceSpacesEndpoint>;
export type GetSpaceHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<GetSpaceEndpoint>;
export type UpdateSpaceHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<UpdateSpaceEndpoint>;
export type CountWorkspaceSpacesHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<CountWorkspaceSpacesEndpoint>;

export type SpacesExportedEndpoints = {
  addSpace: AddSpaceHttpEndpoint;
  deleteSpace: DeleteSpaceHttpEndpoint;
  getWorkspaceSpaces: GetWorkspaceSpacesHttpEndpoint;
  getSpace: GetSpaceHttpEndpoint;
  updateSpace: UpdateSpaceHttpEndpoint;
  countWorkspaceSpaces: CountWorkspaceSpacesHttpEndpoint;
};

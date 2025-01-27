import {ToPublicDefinitions, WorkspaceResource} from './system.js';

export interface Collaborator extends WorkspaceResource {
  providedResourceId: string;
}

export type PublicCollaborator = ToPublicDefinitions<Collaborator>;

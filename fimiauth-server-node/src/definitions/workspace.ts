import {ToPublicDefinitions, WorkspaceResource} from './system.js';

export interface Workspace extends WorkspaceResource {
  name: string;
  description?: string;
  publicPermissionGroupId: string;
}

export type PublicWorkspace = ToPublicDefinitions<Workspace>;

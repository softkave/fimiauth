import {ToPublicDefinitions, WorkspaceResource} from './system.js';

export interface Space extends WorkspaceResource {
  name: string;
  description?: string;
}

export type PublicSpace = ToPublicDefinitions<Space>;

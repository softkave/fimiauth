import {ValueOf} from 'type-fest';
import {
  FimidaraResourceType,
  ToPublicDefinitions,
  WorkspaceResource,
} from './system.js';

export const kFimidaraPermissionActions = {
  wildcard: '*',

  updateWorkspace: 'updateWorkspace',
  deleteWorkspace: 'deleteWorkspace',
  readWorkspace: 'readWorkspace',

  addCollaborator: 'addCollaborator',
  readCollaborator: 'readCollaborator',
  removeCollaborator: 'removeCollaborator',

  readCollaborationRequest: 'readCollaborationRequest',
  revokeCollaborationRequest: 'revokeCollaborationRequest',
  updateCollaborationRequest: 'updateCollaborationRequest',
  deleteCollaborationRequest: 'deleteCollaborationRequest',
  respondToCollaborationRequest: 'respondToCollaborationRequest',

  updatePermission: 'updatePermission',
  readPermission: 'readPermission',

  addAgentToken: 'addAgentToken',
  readAgentToken: 'readAgentToken',
  updateAgentToken: 'updateAgentToken',
  deleteAgentToken: 'deleteAgentToken',

  addSpace: 'addSpace',
  readSpace: 'readSpace',
  updateSpace: 'updateSpace',
  deleteSpace: 'deleteSpace',
} as const;

export type FimidaraPermissionAction =
  | ValueOf<typeof kFimidaraPermissionActions>
  | (string & {});

export type FimidaraPermissionEntityType = FimidaraResourceType | (string & {});
export type FimidaraPermissionTargetType = FimidaraResourceType | (string & {});

export interface PermissionItem extends WorkspaceResource {
  entityId: string;
  entityType: FimidaraPermissionEntityType | (string & {}) | null;
  containerId?: string[];
  targetId: string;
  targetType: FimidaraPermissionTargetType | (string & {}) | null;
  access: boolean;
  action: FimidaraPermissionAction;
}

export type PublicPermissionItem = ToPublicDefinitions<PermissionItem>;

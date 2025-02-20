import {kFimidaraResourceType} from '../../../../definitions/system.js';
import {deleteAgentTokenCascadeEntry} from './agentToken.js';
import {deleteCollaborationRequestCascadeEntry} from './collaborationRequest.js';
import {deleteCollaboratorCascadeEntry} from './collaborator.js';
import {noopDeleteCascadeEntry} from './genericDefinitions.js';
import {deletePermissionGroupCascadeEntry} from './permissionGroup.js';
import {deletePermissionItemCascadeEntry} from './permissionItem.js';
import {deleteSpaceCascadeEntry} from './space.js';
import {DeleteResourceCascadeDefinitions} from './types.js';
import {deleteWorkspaceCascadeEntry} from './workspace.js';

export const kCascadeDeleteDefinitions: DeleteResourceCascadeDefinitions = {
  [kFimidaraResourceType.All]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.System]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.Public]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.EndpointRequest]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.App]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.AssignedItem]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.Job]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.emailMessage]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.emailBlocklist]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.appShard]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.jobHistory]: noopDeleteCascadeEntry,
  [kFimidaraResourceType.Workspace]: deleteWorkspaceCascadeEntry,
  [kFimidaraResourceType.Collaborator]: deleteCollaboratorCascadeEntry,
  [kFimidaraResourceType.CollaborationRequest]:
    deleteCollaborationRequestCascadeEntry,
  [kFimidaraResourceType.AgentToken]: deleteAgentTokenCascadeEntry,
  [kFimidaraResourceType.PermissionGroup]: deletePermissionGroupCascadeEntry,
  [kFimidaraResourceType.Space]: deleteSpaceCascadeEntry,
  [kFimidaraResourceType.PermissionItem]: deletePermissionItemCascadeEntry,
};

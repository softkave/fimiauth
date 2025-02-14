import {PermissionGroup} from '../../../definitions/permissionGroups.js';
import {
  FimidaraPermissionAction,
  PermissionItem,
  kFimidaraPermissionActions,
} from '../../../definitions/permissionItem.js';
import {
  Agent,
  FimidaraResourceType,
  kFimidaraResourceType,
} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {
  getNewIdForResource,
  newWorkspaceResource,
} from '../../../utils/resource.js';

export const kDefaultAdminPermissionGroupName = 'Admin';
export const kDefaultPublicPermissionGroupName = 'Public';
export const kDefaultCollaboratorPermissionGroupName = 'Collaborator';

function generateAdminPermissions(
  agent: Agent,
  workspace: Workspace,
  adminPermissionGroup: PermissionGroup
) {
  const permissionItems: PermissionItem[] = Object.values(
    kFimidaraPermissionActions
  ).map(action => {
    const item: PermissionItem = newWorkspaceResource({
      agent,
      type: kFimidaraResourceType.PermissionItem,
      workspaceId: workspace.resourceId,
      spaceId: workspace.spaceId,
      seed: {
        action,
        entityId: adminPermissionGroup.resourceId,
        entityType: kFimidaraResourceType.PermissionGroup,
        targetId: workspace.resourceId,
        targetType: kFimidaraResourceType.All,
        access: true,
        containerId: [workspace.resourceId],
      },
    });

    return item;
  });

  return permissionItems;
}

function generateCollaboratorPermissions(
  agent: Agent,
  workspace: Workspace,
  permissiongroup: PermissionGroup
) {
  function makePermission(
    actions: FimidaraPermissionAction[],
    targetType: FimidaraResourceType,
    targetId: string
  ) {
    return actions.map(action => {
      const item: PermissionItem = newWorkspaceResource({
        agent,
        type: kFimidaraResourceType.PermissionItem,
        workspaceId: workspace.resourceId,
        spaceId: workspace.spaceId,
        seed: {
          action,
          targetId,
          targetType: targetType,
          entityId: permissiongroup.resourceId,
          entityType: kFimidaraResourceType.PermissionGroup,
          access: true,
          containerId: [workspace.resourceId],
        },
      });

      return item;
    });
  }

  const actions: FimidaraPermissionAction[] = [
    kFimidaraPermissionActions.readWorkspace,
    kFimidaraPermissionActions.readCollaborator,
  ];

  const permissionItems: PermissionItem[] = makePermission(
    actions,
    kFimidaraResourceType.Workspace,
    workspace.resourceId
  );

  return permissionItems;
}

export function generateDefaultWorkspacePermissionGroups(
  agent: Agent,
  workspace: Workspace
) {
  const createdAt = getTimestamp();
  const adminPermissionGroup: PermissionGroup = {
    createdAt,
    lastUpdatedAt: createdAt,
    lastUpdatedBy: agent,
    resourceId: getNewIdForResource(kFimidaraResourceType.PermissionGroup),
    workspaceId: workspace.resourceId,
    createdBy: agent,
    name: kDefaultAdminPermissionGroupName,
    description:
      'Auto-generated permission group with access to every resource in this workspace',
    isDeleted: false,
    spaceId: workspace.spaceId,
  };
  const publicPermissionGroup: PermissionGroup = {
    createdAt,
    lastUpdatedAt: createdAt,
    lastUpdatedBy: agent,
    resourceId: getNewIdForResource(kFimidaraResourceType.PermissionGroup),
    workspaceId: workspace.resourceId,
    createdBy: agent,
    name: kDefaultPublicPermissionGroupName,
    description:
      'Auto-generated permission group for public/anonymous users. ' +
      'Assign permissions to this group for resource/actions you want to be publicly accessible',
    isDeleted: false,
    spaceId: workspace.spaceId,
  };
  const collaboratorPermissionGroup: PermissionGroup = {
    createdAt,
    lastUpdatedAt: createdAt,
    lastUpdatedBy: agent,
    resourceId: getNewIdForResource(kFimidaraResourceType.PermissionGroup),
    workspaceId: workspace.resourceId,
    createdBy: agent,
    name: kDefaultCollaboratorPermissionGroupName,
    description:
      'Auto-generated permission group for collaborators. Open permission group to see permissions',
    isDeleted: false,
    spaceId: workspace.spaceId,
  };
  const permissionItems = generateAdminPermissions(
    agent,
    workspace,
    adminPermissionGroup
  ).concat(
    generateCollaboratorPermissions(
      agent,
      workspace,
      collaboratorPermissionGroup
    )
  );
  return {
    adminPermissionGroup,
    publicPermissionGroup,
    collaboratorPermissionGroup,
    permissionItems,
  };
}

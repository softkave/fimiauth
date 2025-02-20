import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {SemanticProviderMutationParams} from '../../../contexts/semantic/types.js';
import {
  SessionAgent,
  kFimidaraResourceType,
} from '../../../definitions/system.js';
import {Workspace} from '../../../definitions/workspace.js';
import {getTimestamp} from '../../../utils/dateFns.js';
import {getNewIdForResource} from '../../../utils/resource.js';
import {INTERNAL_createAgentToken} from '../../agentTokens/addToken/utils.js';
import {addAssignedPermissionGroupList} from '../../assignedItems/addAssignedItems.js';
import {checkWorkspaceNameExists} from '../checkWorkspaceExists.js';
import {NewWorkspaceInput} from './types.js';
import {generateDefaultWorkspacePermissionGroups} from './utils.js';

const INTERNAL_createWorkspace = async (
  data: NewWorkspaceInput,
  agent: SessionAgent,
  opts: SemanticProviderMutationParams
) => {
  await checkWorkspaceNameExists({
    name: data.name,
    resourceId: undefined,
    opts,
  });

  const createdAt = getTimestamp();
  const id = getNewIdForResource(kFimidaraResourceType.Workspace);
  const workspace: Workspace = {
    publicPermissionGroupId: '', // placeholder, filled in below
    description: data.description,
    lastUpdatedAt: createdAt,
    lastUpdatedBy: {
      agentId: agent.agentId,
      agentType: agent.agentType,
      agentTokenId: agent.agentTokenId,
    },
    isDeleted: false,
    createdBy: {
      agentId: agent.agentId,
      agentType: agent.agentType,
      agentTokenId: agent.agentTokenId,
    },
    name: data.name,
    workspaceId: id,
    resourceId: id,
    createdAt,
    spaceId: id,
  };

  const {
    collaboratorPermissionGroup,
    publicPermissionGroup,
    adminPermissionGroup,
    permissionItems,
  } = generateDefaultWorkspacePermissionGroups(agent, workspace);
  workspace.publicPermissionGroupId = publicPermissionGroup.resourceId;

  await kSemanticModels.workspace().insertItem(workspace, opts);
  const agentToken = await INTERNAL_createAgentToken({
    agent,
    workspaceId: workspace.resourceId,
    spaceId: workspace.spaceId,
    data: {
      name: `Agent token for ${data.userId}`,
      providedResourceId: data.userId,
    },
    opts,
  });

  await Promise.all([
    kSemanticModels
      .permissionGroup()
      .insertItem(
        [
          collaboratorPermissionGroup,
          publicPermissionGroup,
          adminPermissionGroup,
        ],
        opts
      ),
    kSemanticModels.permissionItem().insertItem(permissionItems, opts),
    addAssignedPermissionGroupList({
      agent,
      workspaceId: workspace.resourceId,
      spaceId: workspace.spaceId,
      permissionGroupsInput: [adminPermissionGroup.resourceId],
      assigneeId: agentToken.resourceId,
      deleteExisting: false,
      skipPermissionGroupsExistCheck: true,
      skipAuthCheck: true,
      opts,
    }),
  ]);

  return {workspace, adminPermissionGroup, publicPermissionGroup, agentToken};
};

export default INTERNAL_createWorkspace;

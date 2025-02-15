import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {PermissionGroup} from '../../../definitions/permissionGroups.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {newWorkspaceResource} from '../../../utils/resource.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {checkPermissionGroupNameAvailable} from '../checkPermissionGroupNameAvailable.js';
import {permissionGroupExtractor} from '../utils.js';
import {AddPermissionGroupEndpoint} from './types.js';
import {addPermissionGroupJoiSchema} from './validation.js';

const addPermissionGroup: AddPermissionGroupEndpoint = async reqData => {
  const data = validate(reqData.data, addPermissionGroupJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const workspaceId = getWorkspaceIdFromSessionAgent(agent, data.workspaceId);
  const workspace = await checkWorkspaceExists(workspaceId);
  await checkAuthorizationWithAgent({
    agent,
    workspaceId: workspace.resourceId,
    spaceId: data.spaceId ?? workspace.resourceId,
    target: {
      targetId: workspace.resourceId,
      action: kFimidaraPermissionActions.updatePermission,
    },
  });

  const permissionGroup = await kSemanticModels.utils().withTxn(async opts => {
    await checkPermissionGroupNameAvailable({
      spaceId: data.spaceId ?? workspace.resourceId,
      name: data.name,
      opts,
    });

    const permissionGroup = newWorkspaceResource<PermissionGroup>({
      agent,
      type: kFimidaraResourceType.PermissionGroup,
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.resourceId,
      seed: {...data, workspaceId: workspace.resourceId},
    });

    await kSemanticModels.permissionGroup().insertItem(permissionGroup, opts);
    return permissionGroup;
  });

  return {
    permissionGroup: permissionGroupExtractor(permissionGroup),
  };
};

export default addPermissionGroup;

import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {getPublicAgentToken} from '../utils.js';
import {AddAgentTokenEndpoint} from './types.js';
import {INTERNAL_createAgentToken} from './utils.js';
import {addAgentTokenJoiSchema} from './validation.js';

const addAgentTokenEndpoint: AddAgentTokenEndpoint = async reqData => {
  const data = validate(reqData.data, addAgentTokenJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {workspace} = await getWorkspaceFromEndpointInput(agent, data);
  await checkAuthorizationWithAgent({
    agent,
    spaceId: data.spaceId ?? workspace.resourceId,
    workspaceId: workspace.resourceId,
    target: {
      action: kFimidaraPermissionActions.addAgentToken,
      targetId: workspace.resourceId,
    },
  });

  const token = await kSemanticModels.utils().withTxn(async opts => {
    return await INTERNAL_createAgentToken({
      agent,
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.resourceId,
      data,
      opts,
    });
  });

  return {token: await getPublicAgentToken(token, data.shouldEncode ?? false)};
};

export default addAgentTokenEndpoint;

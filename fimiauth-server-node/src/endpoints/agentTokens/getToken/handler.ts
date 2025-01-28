import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {tryGetAgentTokenId} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {tryGetWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {checkAgentTokenAuthorization02, getPublicAgentToken} from '../utils.js';
import {GetAgentTokenEndpoint} from './types.js';
import {getAgentTokenJoiSchema} from './validation.js';

const getAgentToken: GetAgentTokenEndpoint = async reqData => {
  const data = validate(reqData.data, getAgentTokenJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const {workspace} = await tryGetWorkspaceFromEndpointInput(agent, data);
  const tokenId = tryGetAgentTokenId(agent, data.tokenId, data.onReferenced);
  const {token} = await checkAgentTokenAuthorization02({
    agent,
    workspaceId: workspace?.resourceId,
    spaceId: data.spaceId ?? workspace?.spaceId,
    tokenId,
    providedResourceId: data.providedResourceId,
    action: kFimidaraPermissionActions.readAgentToken,
  });

  return {token: await getPublicAgentToken(token, data.shouldEncode ?? false)};
};

export default getAgentToken;

import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {appAssert} from '../../../utils/assertion.js';
import {tryGetAgentTokenId} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {tryGetWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {checkAgentTokenAuthorization02} from '../utils.js';
import {DeleteAgentTokenEndpoint} from './types.js';
import {beginDeleteAgentToken} from './utils.js';
import {deleteAgentTokenJoiSchema} from './validation.js';

const deleteAgentToken: DeleteAgentTokenEndpoint = async reqData => {
  const data = validate(reqData.data, deleteAgentTokenJoiSchema);
  const agent = await kUtilsInjectables
    .session()
    .getAgentFromReq(
      reqData,
      kSessionUtils.permittedAgentTypes.api,
      kSessionUtils.accessScopes.api
    );

  const tokenId = tryGetAgentTokenId(agent, data.tokenId, data.onReferenced);
  const {workspace} = await tryGetWorkspaceFromEndpointInput(agent, data);
  const {token} = await checkAgentTokenAuthorization02({
    agent,
    tokenId,
    workspaceId: workspace?.resourceId,
    spaceId: data.spaceId ?? workspace?.spaceId,
    providedResourceId: data.providedResourceId,
    action: kFimidaraPermissionActions.deleteAgentToken,
  });

  appAssert(token.workspaceId);
  appAssert(token.spaceId);
  const [job] = await beginDeleteAgentToken({
    agent,
    workspaceId: token.workspaceId,
    spaceId: token.spaceId,
    resources: [token],
  });

  appAssert(job);
  return {jobId: job.resourceId};
};

export default deleteAgentToken;

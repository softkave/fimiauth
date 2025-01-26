import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {CountUserCollaborationRequestsEndpoint} from './types.js';
import {countUserRequestsJoiSchema} from './validation.js';

const countUserCollaborationRequests: CountUserCollaborationRequestsEndpoint =
  async reqData => {
    const data = validate(reqData.data, countUserRequestsJoiSchema);
    const agent = await kUtilsInjectables
      .session()
      .getAgentFromReq(
        reqData,
        kSessionUtils.permittedAgentTypes.api,
        kSessionUtils.accessScopes.api
      );

    const {workspace} = await getWorkspaceFromEndpointInput(agent, data);
    const count = await kSemanticModels
      .collaborationRequest()
      .countByEmail(workspace.resourceId, data.email);

    return {count};
  };

export default countUserCollaborationRequests;

import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {validate} from '../../../utils/validate.js';
import {
  applyDefaultEndpointPaginationOptions,
  getEndpointPageFromInput,
} from '../../pagination.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {collaborationRequestForUserListExtractor} from '../utils.js';
import {GetUserCollaborationRequestsEndpoint} from './types.js';
import {getUserRequestsJoiSchema} from './validation.js';

const getUserCollaborationRequests: GetUserCollaborationRequestsEndpoint =
  async reqData => {
    const data = validate(reqData.data, getUserRequestsJoiSchema);
    const agent = await kUtilsInjectables
      .session()
      .getAgentFromReq(
        reqData,
        kSessionUtils.permittedAgentTypes.api,
        kSessionUtils.accessScopes.api
      );

    applyDefaultEndpointPaginationOptions(data);
    const {workspace} = await getWorkspaceFromEndpointInput(agent, data);
    const requests = await kSemanticModels
      .collaborationRequest()
      .getManyByEmail(workspace.resourceId, data.email, data);

    return {
      page: getEndpointPageFromInput(data),
      requests: collaborationRequestForUserListExtractor(requests),
    };
  };

export default getUserCollaborationRequests;

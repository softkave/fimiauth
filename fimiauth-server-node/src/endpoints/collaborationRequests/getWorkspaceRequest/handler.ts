import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {
  checkCollaborationRequestAuthorization02,
  collaborationRequestForWorkspaceExtractor,
} from '../utils.js';
import {GetWorkspaceCollaborationRequestEndpoint} from './types.js';
import {getWorkspaceCollaborationRequestJoiSchema} from './validation.js';

const getWorkspaceCollaborationRequest: GetWorkspaceCollaborationRequestEndpoint =
  async reqData => {
    const data = validate(
      reqData.data,
      getWorkspaceCollaborationRequestJoiSchema
    );
    const agent = await kUtilsInjectables
      .session()
      .getAgentFromReq(
        reqData,
        kSessionUtils.permittedAgentTypes.api,
        kSessionUtils.accessScopes.api
      );

    const {request} = await checkCollaborationRequestAuthorization02(
      agent,
      data.requestId,
      kFimidaraPermissionActions.readCollaborationRequest
    );

    return {request: collaborationRequestForWorkspaceExtractor(request)};
  };

export default getWorkspaceCollaborationRequest;

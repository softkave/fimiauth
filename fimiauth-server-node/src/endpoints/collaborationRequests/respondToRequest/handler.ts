import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {collaborationRequestForUserExtractor} from '../utils.js';
import {RespondToCollaborationRequestEndpoint} from './types.js';
import {
  INTERNAL_respondToCollaborationRequest,
  notifySenderOnCollaborationRequestResponse,
} from './utils.js';
import {respondToCollaborationRequestJoiSchema} from './validation.js';

const respondToCollaborationRequest: RespondToCollaborationRequestEndpoint =
  async reqData => {
    const data = validate(reqData.data, respondToCollaborationRequestJoiSchema);
    const agent = await kUtilsInjectables
      .session()
      .getAgentFromReq(
        reqData,
        kSessionUtils.permittedAgentTypes.api,
        kSessionUtils.accessScopes.api
      );

    if (data.userId) {
      await kUtilsInjectables.session().getSystemAgent(reqData);
    }

    const request = await kSemanticModels.utils().withTxn(async opts => {
      return await INTERNAL_respondToCollaborationRequest({
        agent,
        data,
        opts,
      });
    });

    await notifySenderOnCollaborationRequestResponse(request);
    return {request: collaborationRequestForUserExtractor(request)};
  };

export default respondToCollaborationRequest;

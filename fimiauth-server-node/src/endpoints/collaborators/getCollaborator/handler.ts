import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {getCollaborator} from '../getCollaborator.js';
import {collaboratorExtractor} from '../utils.js';
import {GetCollaboratorEndpoint} from './types.js';
import {getCollaboratorJoiSchema} from './validation.js';

const getCollaboratorEndpointHandler: GetCollaboratorEndpoint =
  async reqData => {
    const data = validate(reqData.data, getCollaboratorJoiSchema);
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
      workspace,
      workspaceId: workspace.resourceId,
      target: {targetId: workspace.resourceId, action: 'readCollaborator'},
    });

    const collaborator = await getCollaborator({
      collaboratorId: data.collaboratorId,
      providedResourceId: data.providedResourceId,
      workspaceId,
    });

    return {
      collaborator: collaboratorExtractor(collaborator),
    };
  };

export default getCollaboratorEndpointHandler;

import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {getEndpointPageFromInput} from '../../pagination.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {collaboratorListExtractor} from '../utils.js';
import {GetWorkspaceCollaboratorsEndpoint} from './types.js';
import {getWorkspaceCollaboratorsJoiSchema} from './validation.js';

const getWorkspaceCollaborators: GetWorkspaceCollaboratorsEndpoint =
  async reqData => {
    const data = validate(reqData.data, getWorkspaceCollaboratorsJoiSchema);
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

    const collaborators = await kSemanticModels
      .collaborator()
      .getManyByWorkspaceId(workspaceId);

    return {
      page: getEndpointPageFromInput(data),
      collaborators: collaboratorListExtractor(collaborators),
    };
  };

export default getWorkspaceCollaborators;

import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {
  applyDefaultEndpointPaginationOptions,
  getEndpointPageFromInput,
} from '../../pagination.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {collaboratorListExtractor} from '../utils.js';
import {GetWorkspaceCollaboratorsEndpoint} from './types.js';
import {getWorkspaceCollaboratorsQuery} from './utils.js';
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
      workspaceId: workspace.resourceId,
      spaceId: data.spaceId ?? workspace.spaceId,
      target: {
        targetId: workspace.resourceId,
        action: kFimidaraPermissionActions.readCollaborator,
      },
    });

    const q = await getWorkspaceCollaboratorsQuery(
      agent,
      workspace,
      data.spaceId ?? workspace.resourceId
    );

    applyDefaultEndpointPaginationOptions(data);
    const collaborators = await kSemanticModels
      .collaborator()
      .getManyBySpaceAndIdList(q, data);

    return {
      page: getEndpointPageFromInput(data),
      collaborators: collaboratorListExtractor(collaborators),
    };
  };

export default getWorkspaceCollaborators;

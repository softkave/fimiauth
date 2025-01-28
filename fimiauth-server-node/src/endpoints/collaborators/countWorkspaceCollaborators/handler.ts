import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {validate} from '../../../utils/validate.js';
import {getWorkspaceFromEndpointInput} from '../../workspaces/utils.js';
import {getWorkspaceCollaboratorsQuery} from '../getWorkspaceCollaborators/utils.js';
import {CountWorkspaceCollaboratorsEndpoint} from './types.js';
import {countWorkspaceCollaboratorsJoiSchema} from './validation.js';

const countWorkspaceCollaborators: CountWorkspaceCollaboratorsEndpoint =
  async reqData => {
    const data = validate(reqData.data, countWorkspaceCollaboratorsJoiSchema);
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
      workspace,
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

    const count = await kSemanticModels
      .collaborator()
      .countManyByWorkspaceAndIdList(q);

    return {count};
  };

export default countWorkspaceCollaborators;

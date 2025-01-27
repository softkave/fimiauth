import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {Collaborator} from '../../../definitions/collaborator.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {newWorkspaceResource} from '../../../utils/resource.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {ResourceExistsError} from '../../errors.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {collaboratorExtractor} from '../utils.js';
import {AddCollaboratorEndpoint} from './types.js';
import {addCollaboratorJoiSchema} from './validation.js';

const addCollaborator: AddCollaboratorEndpoint = async reqData => {
  const data = validate(reqData.data, addCollaboratorJoiSchema);
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
    target: {targetId: workspace.resourceId, action: 'addCollaborator'},
  });

  const collaborator = await kSemanticModels.utils().withTxn(async opts => {
    const existingCollaborator = await kSemanticModels
      .collaborator()
      .getByProvidedId(workspace.resourceId, data.providedResourceId, opts);

    if (existingCollaborator) {
      throw new ResourceExistsError('Collaborator already exists');
    }

    const collaborator = newWorkspaceResource<Collaborator>(
      agent,
      kFimidaraResourceType.Collaborator,
      workspace.resourceId,
      {...data, workspaceId: workspace.resourceId}
    );
    await kSemanticModels.collaborator().insertItem(collaborator, opts);

    return collaborator;
  });

  return {
    collaborator: collaboratorExtractor(collaborator),
  };
};

export default addCollaborator;
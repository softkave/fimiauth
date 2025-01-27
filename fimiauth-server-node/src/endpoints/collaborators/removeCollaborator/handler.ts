import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kUtilsInjectables} from '../../../contexts/injection/injectables.js';
import {kFimidaraPermissionActions} from '../../../definitions/permissionItem.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {getCollaborator} from '../getCollaborator.js';
import {RemoveCollaboratorEndpoint} from './types.js';
import {beginDeleteCollaborator} from './utils.js';
import {removeCollaboratorJoiSchema} from './validation.js';

const removeCollaborator: RemoveCollaboratorEndpoint = async reqData => {
  const data = validate(reqData.data, removeCollaboratorJoiSchema);
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
    target: {
      targetId: workspace.resourceId,
      action: kFimidaraPermissionActions.removeCollaborator,
    },
  });

  const collaborator = await getCollaborator({
    workspaceId,
    providedResourceId: data.collaboratorId,
    collaboratorId: data.collaboratorId,
  });

  const [job] = await beginDeleteCollaborator({
    agent,
    workspaceId,
    resources: [collaborator],
  });

  return {jobId: job.resourceId};
};

export default removeCollaborator;

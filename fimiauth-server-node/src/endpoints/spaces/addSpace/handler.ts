import {kSessionUtils} from '../../../contexts/SessionContext.js';
import {checkAuthorizationWithAgent} from '../../../contexts/authorizationChecks/checkAuthorizaton.js';
import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {Space} from '../../../definitions/space.js';
import {kFimidaraResourceType} from '../../../definitions/system.js';
import {newWorkspaceResource} from '../../../utils/resource.js';
import {getWorkspaceIdFromSessionAgent} from '../../../utils/sessionUtils.js';
import {validate} from '../../../utils/validate.js';
import {checkWorkspaceExists} from '../../workspaces/utils.js';
import {checkSpaceNameExists} from '../checkSpaceNameExists.js';
import {spaceExtractor} from '../utils.js';
import {AddSpaceEndpoint} from './types.js';
import {addSpaceJoiSchema} from './validation.js';

const addSpace: AddSpaceEndpoint = async reqData => {
  const data = validate(reqData.data, addSpaceJoiSchema);
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
    target: {targetId: workspace.resourceId, action: 'addSpace'},
    spaceId: workspace.resourceId,
  });

  let space = await kSemanticModels.utils().withTxn(async opts => {
    await checkSpaceNameExists(workspace.resourceId, data.name, opts);
    const space = newWorkspaceResource<Space>({
      agent,
      type: kFimidaraResourceType.Space,
      workspaceId: workspace.resourceId,
      spaceId: workspace.resourceId,
      seed: {...data, workspaceId: workspace.resourceId},
    });
    await kSemanticModels.space().insertItem(space, opts);
    return space;
  });

  return {
    space: spaceExtractor(space),
  };
};

export default addSpace;

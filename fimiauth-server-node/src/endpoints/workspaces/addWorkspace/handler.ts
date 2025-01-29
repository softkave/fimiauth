import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {validate} from '../../../utils/validate.js';
import {encodeAgentToken} from '../../agentTokens/utils.js';
import {workspaceExtractor} from '../utils.js';
import INTERNAL_createWorkspace from './internalCreateWorkspace.js';
import {AddWorkspaceEndpoint} from './types.js';
import {addWorkspaceJoiSchema} from './validation.js';

const addWorkspace: AddWorkspaceEndpoint = async reqData => {
  const data = validate(reqData.data, addWorkspaceJoiSchema);
  const agent = await kUtilsInjectables.session().getSystemAgent(reqData);

  const {workspace, agentToken} = await kSemanticModels
    .utils()
    .withTxn(async opts => {
      return await INTERNAL_createWorkspace(data, agent, opts);
    });

  const {jwtTokenExpiresAt, refreshToken, jwtToken} =
    await encodeAgentToken(agentToken);

  return {
    workspace: workspaceExtractor(workspace),
    token: {jwtTokenExpiresAt, refreshToken, jwtToken},
  };
};

export default addWorkspace;

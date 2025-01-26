import {
  kSemanticModels,
  kUtilsInjectables,
} from '../../../contexts/injection/injectables.js';
import {AgentToken} from '../../../definitions/agentToken.js';
import {validate} from '../../../utils/validate.js';
import {encodeAgentToken} from '../../agentTokens/utils.js';
import {
  applyDefaultEndpointPaginationOptions,
  getEndpointPageFromInput,
} from '../../pagination.js';
import {workspaceExtractor} from '../utils.js';
import {GetUserWorkspacesEndpoint} from './types.js';
import {getUserWorkspacesJoiSchema} from './validation.js';

const getUserWorkspaces: GetUserWorkspacesEndpoint = async reqData => {
  const data = validate(reqData.data, getUserWorkspacesJoiSchema);
  const systemAgent = await kUtilsInjectables.session().getSystemAgent(reqData);

  applyDefaultEndpointPaginationOptions(data);
  const agentTokens = await kSemanticModels
    .agentToken()
    .getManyByUserId(systemAgent.agentId, data.userId);
  const agentTokensByWorkspaceId = agentTokens.reduce(
    (acc, token) => {
      acc[token.workspaceId] = token;
      return acc;
    },
    {} as Record<string, AgentToken>
  );

  const workspaceIdList = Object.keys(agentTokensByWorkspaceId);
  const workspaces = await kSemanticModels
    .workspace()
    .getManyByIdList(workspaceIdList, data);

  return {
    page: getEndpointPageFromInput(data),
    workspaces: await Promise.all(
      workspaces.map(async workspace => ({
        workspace: workspaceExtractor(workspace),
        agentToken: await encodeAgentToken(
          agentTokensByWorkspaceId[workspace.resourceId]
        ),
      }))
    ),
  };
};

export default getUserWorkspaces;

import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {AgentToken} from '../../definitions/agentToken.js';

export async function getAgentToken(params: {
  workspaceId?: string;
  spaceId?: string;
  providedResourceId?: string;
  resourceId?: string;
}) {
  let agentToken: AgentToken | null = null;

  if (params.resourceId) {
    agentToken = await kSemanticModels
      .agentToken()
      .getOneById(params.resourceId);
  } else if (params.workspaceId && params.providedResourceId) {
    agentToken = await kSemanticModels
      .agentToken()
      .getByProvidedId(params.workspaceId, params.providedResourceId);
  } else if (params.spaceId && params.providedResourceId) {
    agentToken = await kSemanticModels
      .agentToken()
      .getBySpaceIdAndProvidedId(params.spaceId, params.providedResourceId);
  }

  return agentToken;
}

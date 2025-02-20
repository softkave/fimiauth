import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {AgentToken} from '../../definitions/agentToken.js';

export async function getAgentToken(params: {
  workspaceId?: string;
  spaceId?: string;
  providedResourceId?: string | null;
  resourceId?: string | null;
}) {
  let agentToken: AgentToken | null = null;

  if (params.resourceId) {
    agentToken = await kSemanticModels
      .agentToken()
      .getOneById(params.resourceId);
  } else if (params.workspaceId && params.providedResourceId) {
    agentToken = await kSemanticModels.agentToken().getByProvidedId({
      spaceId: params.workspaceId,
      providedId: params.providedResourceId,
    });
  } else if (params.spaceId && params.providedResourceId) {
    agentToken = await kSemanticModels.agentToken().getBySpaceIdAndProvidedId({
      spaceId: params.spaceId,
      providedId: params.providedResourceId,
    });
  }

  return agentToken;
}

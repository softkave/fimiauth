import {AgentToken} from '../definitions/agentToken.js';
import {
  Agent,
  kFimidaraResourceType,
  SessionAgent,
} from '../definitions/system.js';
import {InvalidRequestError} from '../endpoints/errors.js';

export function makeWorkspaceAgentTokenAgent(
  agentToken: AgentToken
): SessionAgent {
  return {
    agentToken,
    agentId: agentToken.resourceId,
    agentType: kFimidaraResourceType.AgentToken,
    agentTokenId: agentToken.resourceId,
  };
}

export function getWorkspaceIdNoThrow(
  agent: SessionAgent,
  providedWorkspaceId?: string
) {
  const workspaceId = providedWorkspaceId
    ? providedWorkspaceId
    : agent.agentToken
      ? agent.agentToken.workspaceId
      : undefined;
  return workspaceId;
}

export function getWorkspaceIdFromSessionAgent(
  agent: SessionAgent,
  providedWorkspaceId?: string
) {
  const workspaceId = getWorkspaceIdNoThrow(agent, providedWorkspaceId);

  if (!workspaceId) {
    throw new InvalidRequestError('Workspace ID not provided');
  }
  return workspaceId;
}

export function tryGetAgentTokenId(
  agent: SessionAgent,
  providedTokenId?: string | null,
  onReferenced?: boolean
) {
  const tokenId = providedTokenId
    ? providedTokenId
    : onReferenced
      ? agent.agentToken?.resourceId
      : null;
  return tokenId;
}

export function assertGetWorkspaceIdFromAgent(agent: SessionAgent) {
  const workspaceId = agent.agentToken ? agent.agentToken.workspaceId : null;
  if (!workspaceId) {
    throw new InvalidRequestError('Workspace ID not provided');
  }

  return workspaceId;
}

export function getActionAgentFromSessionAgent(
  sessionAgent: SessionAgent
): Agent {
  const agent: Agent = {
    agentId: sessionAgent.agentId,
    agentType: sessionAgent.agentType,
    agentTokenId: sessionAgent.agentTokenId,
  };
  return agent;
}

export function isSessionAgent(agent: unknown): agent is SessionAgent {
  if (!(agent as SessionAgent).agentId || !(agent as SessionAgent).agentType)
    return false;
  if (
    (agent as SessionAgent).agentToken ||
    (agent as SessionAgent).agentType === kFimidaraResourceType.System ||
    (agent as SessionAgent).agentType === kFimidaraResourceType.Public
  )
    return true;

  return false;
}

import {checkAuthorizationWithAgent} from '../../contexts/authorizationChecks/checkAuthorizaton.js';
import {kUtilsInjectables} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {
  AgentToken,
  EncodedAgentToken,
  PublicAgentToken,
} from '../../definitions/agentToken.js';
import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {SessionAgent} from '../../definitions/system.js';
import {appAssert} from '../../utils/assertion.js';
import {getFields, makeExtract, makeListExtract} from '../../utils/extract.js';
import {cast} from '../../utils/fns.js';
import {kReuseableErrors} from '../../utils/reusableErrors.js';
import {workspaceResourceFields} from '../extractors.js';
import {kAgentTokenConstants} from './constants.js';
import {getAgentToken} from './getAgentToken.js';

const agentTokenFields = getFields<PublicAgentToken>({
  ...workspaceResourceFields,
  name: true,
  description: true,
  jwtToken: true,
  expiresAt: true,
  providedResourceId: true,
  refreshToken: true,
  jwtTokenExpiresAt: true,
  // tags: assignedTagListExtractor,
});

export const agentTokenExtractor = makeExtract(agentTokenFields);
export const agentTokenListExtractor = makeListExtract(agentTokenFields);

export async function checkAgentTokenAuthorization(params: {
  agent: SessionAgent;
  token: AgentToken;
  action: FimidaraPermissionAction;
  opts?: SemanticProviderOpParams;
}) {
  const {agent, token, action, opts} = params;
  appAssert(token.workspaceId);
  await checkAuthorizationWithAgent({
    agent,
    opts,
    workspaceId: token.workspaceId,
    spaceId: token.spaceId ?? token.workspaceId,
    target: {action, targetId: token.resourceId},
  });

  return {token};
}

export async function checkAgentTokenAuthorization02(params: {
  agent: SessionAgent;
  workspaceId: string | undefined;
  spaceId: string | undefined;
  tokenId: string | undefined | null;
  providedResourceId: string | undefined | null;
  action: FimidaraPermissionAction;
}) {
  const {agent, workspaceId, spaceId, tokenId, providedResourceId, action} =
    params;
  const token = await getAgentToken({
    workspaceId,
    resourceId: tokenId,
    providedResourceId,
    spaceId,
  });

  assertAgentToken(token);
  return await checkAgentTokenAuthorization({agent, token, action});
}

export function throwAgentTokenNotFound() {
  throw kReuseableErrors.agentToken.notFound();
}

export async function encodeAgentToken(
  token: AgentToken
): Promise<EncodedAgentToken> {
  let expiresAt = token.expiresAt;

  if (token.shouldRefresh) {
    expiresAt = Math.min(
      Date.now() +
        (token.refreshDuration ?? kAgentTokenConstants.refreshDurationMs),
      token.expiresAt || Number.MAX_SAFE_INTEGER
    );
  }

  return await kUtilsInjectables.session().encodeToken({
    expiresAt,
    shouldRefresh: token.shouldRefresh,
    tokenId: token.resourceId,
    issuedAt: token.createdAt,
  });
}

export async function getPublicAgentToken(
  token: AgentToken,
  shouldEncode: boolean
) {
  if (shouldEncode) {
    const {jwtTokenExpiresAt, refreshToken, jwtToken} =
      await encodeAgentToken(token);

    cast<PublicAgentToken>(token).jwtToken = jwtToken;
    cast<PublicAgentToken>(token).refreshToken = refreshToken;
    cast<PublicAgentToken>(token).jwtTokenExpiresAt = jwtTokenExpiresAt;
  }

  return agentTokenExtractor(token);
}

export function assertAgentToken(token?: AgentToken | null): asserts token {
  appAssert(token, kReuseableErrors.agentToken.notFound());
}

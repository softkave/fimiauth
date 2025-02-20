import {AgentToken} from '../../../definitions/agentToken.js';
import {TokenAccessScope} from '../../../definitions/system.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
  SemanticWorkspaceResourceProviderType,
} from '../types.js';

export interface SemanticAgentTokenProvider
  extends SemanticWorkspaceResourceProviderType<AgentToken> {
  softDeleteAgentTokens(
    userId: string,
    tokenScope: TokenAccessScope | TokenAccessScope[] | undefined,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
  getUserAgentToken(
    userId: string,
    tokenScope?: TokenAccessScope | TokenAccessScope[],
    opts?: SemanticProviderQueryParams<AgentToken>
  ): Promise<AgentToken | null>;
  getManyByUserId(
    userId: string,
    opts?: SemanticProviderQueryListParams<AgentToken>
  ): Promise<AgentToken[]>;
  countManyByUserId(
    userId: string,
    opts?: SemanticProviderOpParams
  ): Promise<number>;
}

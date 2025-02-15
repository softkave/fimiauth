import {AgentToken} from '../../../definitions/agentToken.js';
import {TokenAccessScope} from '../../../definitions/system.js';
import {AgentTokenQueries} from '../../../endpoints/agentTokens/queries.js';
import {kSystemSessionAgent} from '../../../utils/agent.js';
import {DataQuery} from '../../data/types.js';
import {addIsDeletedIntoQuery} from '../SemanticBaseProvider.js';
import {SemanticWorkspaceResourceProvider} from '../SemanticWorkspaceResourceProvider.js';
import {
  SemanticProviderMutationParams,
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
} from '../types.js';
import {SemanticAgentTokenProvider} from './types.js';

export class SemanticAgentToken
  extends SemanticWorkspaceResourceProvider<AgentToken>
  implements SemanticAgentTokenProvider
{
  async softDeleteAgentTokens(
    userId: string,
    tokenScope: TokenAccessScope | TokenAccessScope[] | undefined,
    opts: SemanticProviderMutationParams
  ): Promise<void> {
    const query = addIsDeletedIntoQuery<DataQuery<AgentToken>>(
      AgentTokenQueries.getByEntityAndScope({
        forEntityId: userId,
        scope: tokenScope,
      }),
      opts?.includeDeleted || true
    );
    await this.softDeleteManyByQuery(query, kSystemSessionAgent, opts);
  }

  async getUserAgentToken(
    userId: string,
    tokenScope?: TokenAccessScope | TokenAccessScope[] | undefined,
    opts?: SemanticProviderQueryParams<AgentToken> | undefined
  ): Promise<AgentToken | null> {
    const query = addIsDeletedIntoQuery<DataQuery<AgentToken>>(
      AgentTokenQueries.getByEntityAndScope({
        forEntityId: userId,
        scope: tokenScope,
      }),
      opts?.includeDeleted || false
    );
    return await this.data.getOneByQuery(query, opts);
  }

  async getManyByUserId(
    userId: string,
    opts?: SemanticProviderQueryListParams<AgentToken> | undefined
  ): Promise<AgentToken[]> {
    const query = addIsDeletedIntoQuery<DataQuery<AgentToken>>(
      {forEntityId: userId},
      opts?.includeDeleted || false
    );
    return await this.data.getManyByQuery(query, opts);
  }

  async countManyByUserId(
    userId: string,
    opts?: SemanticProviderOpParams | undefined
  ): Promise<number> {
    const query = addIsDeletedIntoQuery<DataQuery<AgentToken>>(
      {forEntityId: userId},
      opts?.includeDeleted || false
    );
    return await this.data.countByQuery(query, opts);
  }
}

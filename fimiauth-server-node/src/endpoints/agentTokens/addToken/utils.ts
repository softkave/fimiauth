import {defaultTo} from 'lodash-es';
import {AnyObject} from 'softkave-js-utils';
import {kSemanticModels} from '../../../contexts/injection/injectables.js';
import {SemanticProviderMutationParams} from '../../../contexts/semantic/types.js';
import {AgentToken} from '../../../definitions/agentToken.js';
import {
  Agent,
  kCurrentJWTTokenVersion,
  kFimidaraResourceType,
  kTokenAccessScope,
} from '../../../definitions/system.js';
import {newWorkspaceResource} from '../../../utils/resource.js';
import {kReuseableErrors} from '../../../utils/reusableErrors.js';
import {checkAgentTokenNameAvailable} from '../checkAgentTokenNameAvailable.js';
import {kAgentTokenConstants} from '../constants.js';
import {getAgentToken} from '../getAgentToken.js';
import {NewAgentTokenInput} from './types.js';

export const INTERNAL_createAgentToken = async (params: {
  agent: Agent;
  workspaceId: string;
  spaceId?: string;
  data: NewAgentTokenInput;
  opts: SemanticProviderMutationParams;
  seed?: Partial<AgentToken>;
}) => {
  const {agent, workspaceId, spaceId, data, opts, seed} = params;
  let token = await getAgentToken({
    workspaceId,
    spaceId,
    providedResourceId: data.providedResourceId,
  });

  if (token) {
    throw kReuseableErrors.agentToken.withProvidedIdExists(
      data.providedResourceId
    );
  }

  token = newWorkspaceResource<AgentToken>({
    agent,
    workspaceId,
    spaceId: spaceId || workspaceId,
    type: kFimidaraResourceType.AgentToken,
    seed: {
      ...data,
      providedResourceId: defaultTo(data.providedResourceId, null),
      version: kCurrentJWTTokenVersion,
      forEntityId: null,
      entityType: kFimidaraResourceType.AgentToken,
      scope: [kTokenAccessScope.access],
      shouldRefresh: data.shouldRefresh,
      refreshDuration:
        data.refreshDuration || kAgentTokenConstants.refreshDurationMs,
      ...(seed as AnyObject),
    },
  });

  if (data.name) {
    await checkAgentTokenNameAvailable(workspaceId, data.name, opts);
  }

  await kSemanticModels.agentToken().insertItem(token, opts);
  return token;
};

import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {ResourceExistsError} from '../errors.js';

export async function checkAgentTokenNameAvailable(params: {
  spaceId: string;
  name: string;
  opts?: SemanticProviderOpParams;
}) {
  const {spaceId, name, opts} = params;
  const itemExists = await kSemanticModels
    .agentToken()
    .existsByName({spaceId, name}, opts);

  if (itemExists) {
    throw new ResourceExistsError('Agent token exists');
  }
}

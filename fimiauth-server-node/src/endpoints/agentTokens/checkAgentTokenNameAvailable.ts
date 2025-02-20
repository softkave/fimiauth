import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {ResourceExistsError} from '../errors.js';

export async function checkAgentTokenNameAvailable(params: {
  spaceId: string;
  name: string;
  resourceId?: string;
  opts?: SemanticProviderOpParams;
}) {
  const {spaceId, name, opts, resourceId} = params;
  const item = await kSemanticModels
    .agentToken()
    .getByName({spaceId, name}, {...opts, projection: {resourceId: true}});

  if (item && item.resourceId !== resourceId) {
    throw new ResourceExistsError('Agent token exists');
  }
}

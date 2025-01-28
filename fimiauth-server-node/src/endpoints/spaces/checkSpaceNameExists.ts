import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {ResourceExistsError} from '../errors.js';

export async function checkSpaceNameExists(
  workspaceId: string,
  name: string,
  opts?: SemanticProviderOpParams
) {
  const itemExists = await kSemanticModels
    .space()
    .existsByName(workspaceId, name, opts);

  if (itemExists) {
    throw new ResourceExistsError('Space exists');
  }
}

import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {WorkspaceExistsError} from './errors.js';

export async function checkWorkspaceNameExists(
  name: string,
  opts?: SemanticProviderOpParams
) {
  const workspaceExists = await kSemanticModels
    .workspace()
    .workspaceExistsByName(name, opts);

  if (workspaceExists) {
    throw new WorkspaceExistsError();
  }
}

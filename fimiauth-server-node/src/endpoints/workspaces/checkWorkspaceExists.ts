import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {ResourceExistsError} from '../errors.js';

export async function checkWorkspaceNameExists(params: {
  name: string;
  resourceId?: string;
  opts?: SemanticProviderOpParams;
}) {
  const {name, opts, resourceId} = params;
  const workspace = await kSemanticModels
    .workspace()
    .getWorkspaceByName(name, {...opts, projection: {resourceId: true}});

  if (workspace && workspace.resourceId !== resourceId) {
    throw new ResourceExistsError('Workspace exists');
  }
}

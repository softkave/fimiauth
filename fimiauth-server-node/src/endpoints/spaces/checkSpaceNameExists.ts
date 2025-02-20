import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {SemanticProviderOpParams} from '../../contexts/semantic/types.js';
import {ResourceExistsError} from '../errors.js';

export async function checkSpaceNameExists(params: {
  workspaceId: string;
  name: string;
  resourceId?: string;
  opts?: SemanticProviderOpParams;
}) {
  const {workspaceId, name, opts, resourceId} = params;
  const item = await kSemanticModels
    .space()
    .getByName(
      {spaceId: workspaceId, name},
      {...opts, projection: {resourceId: true}}
    );

  if (item && item.resourceId !== resourceId) {
    throw new ResourceExistsError('Space exists');
  }
}

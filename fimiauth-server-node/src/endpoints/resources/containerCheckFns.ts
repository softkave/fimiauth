import {format} from 'util';
import {WorkspaceResource} from '../../definitions/system.js';
import {NotFoundError} from '../errors.js';

export function isResourcePartOfSpace(
  spaceId: string,
  resource: WorkspaceResource
) {
  return resource.spaceId === spaceId;
}

export function getResourcesNotPartOfSpace(
  spaceId: string,
  resources: WorkspaceResource[]
) {
  return resources.filter(item => !isResourcePartOfSpace(spaceId, item));
}

export function getResourcesPartOfSpace(
  spaceId: string,
  resources: WorkspaceResource[]
) {
  return resources.filter(item => isResourcePartOfSpace(spaceId, item));
}

export function hasResourcesNotPartOfSpace(
  spaceId: string,
  resources: WorkspaceResource[]
) {
  return getResourcesNotPartOfSpace(spaceId, resources).length > 0;
}

function returnNotFoundError(outsideResources: WorkspaceResource[]) {
  const message = format(
    'The following resources do not exist \n%s',
    outsideResources.map(item => item.resourceId).join(', ')
  );

  throw new NotFoundError(message);
}

export function checkResourcesBelongToSpace(
  spaceId: string,
  resources: WorkspaceResource[],
  getErrorFn = returnNotFoundError
) {
  const outsideResources = getResourcesNotPartOfSpace(spaceId, resources);

  if (outsideResources.length) {
    throw getErrorFn(outsideResources);
  }
}

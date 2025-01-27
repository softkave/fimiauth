import {kSemanticModels} from '../../contexts/injection/injectables.js';
import {Collaborator} from '../../definitions/collaborator.js';
import {InvalidRequestError, NotFoundError} from '../errors.js';

export async function getCollaborator(params: {
  collaboratorId?: string;
  providedResourceId?: string;
  workspaceId: string;
}) {
  let collaborator: Collaborator | null = null;
  if (params.collaboratorId) {
    collaborator = await kSemanticModels
      .collaborator()
      .getOneById(params.collaboratorId);
  } else if (params.providedResourceId) {
    collaborator = await kSemanticModels
      .collaborator()
      .getByProvidedId(params.workspaceId, params.providedResourceId);
  } else {
    throw new InvalidRequestError(
      'Either collaboratorId or providedResourceId must be provided'
    );
  }

  if (!collaborator) {
    throw new NotFoundError('Collaborator not found');
  }

  return collaborator;
}

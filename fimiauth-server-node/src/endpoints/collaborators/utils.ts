import {PublicCollaborator} from '../../definitions/collaborator.js';
import {getFields, makeExtract, makeListExtract} from '../../utils/extract.js';
import {NotFoundError} from '../errors.js';
import {workspaceResourceFields} from '../extractors.js';

const collaboratorFields = getFields<PublicCollaborator>({
  ...workspaceResourceFields,
  providedResourceId: true,
});

export const collaboratorExtractor = makeExtract(collaboratorFields);
export const collaboratorListExtractor = makeListExtract(collaboratorFields);

export function throwCollaboratorNotFound() {
  throw new NotFoundError('Collaborator not found');
}

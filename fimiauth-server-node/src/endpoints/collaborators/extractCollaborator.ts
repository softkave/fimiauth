import {Collaborator} from '../../definitions/collaborator.js';
import {collaboratorExtractor} from './utils.js';

export async function extractCollaborator(collaborator: Collaborator) {
  return collaboratorExtractor(collaborator);
}

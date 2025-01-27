import {PublicCollaborator} from '../../../definitions/collaborator.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';

export interface NewCollaboratorInput {
  providedResourceId: string;
}

export interface AddCollaboratorEndpointParams
  extends EndpointOptionalWorkspaceIDParam,
    NewCollaboratorInput {}

export interface AddCollaboratorEndpointResult {
  collaborator: PublicCollaborator;
}

export type AddCollaboratorEndpoint = Endpoint<
  AddCollaboratorEndpointParams,
  AddCollaboratorEndpointResult
>;

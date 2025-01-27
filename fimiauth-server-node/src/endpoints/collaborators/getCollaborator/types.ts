import {PublicCollaborator} from '../../../definitions/collaborator.js';
import {Endpoint, EndpointWorkspaceResourceParam} from '../../types.js';

export interface GetCollaboratorEndpointParams
  extends EndpointWorkspaceResourceParam {
  collaboratorId?: string;
}

export interface GetCollaboratorEndpointResult {
  collaborator: PublicCollaborator;
}

export type GetCollaboratorEndpoint = Endpoint<
  GetCollaboratorEndpointParams,
  GetCollaboratorEndpointResult
>;

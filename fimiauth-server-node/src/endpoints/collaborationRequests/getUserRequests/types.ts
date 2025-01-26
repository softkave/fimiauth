import {PublicCollaborationRequestForUser} from '../../../definitions/collaborationRequest.js';
import {
  Endpoint,
  EndpointOptionalWorkspaceIDParam,
  PaginatedResult,
  PaginationQuery,
} from '../../types.js';

export interface GetUserCollaborationRequestsEndpointParams
  extends PaginationQuery,
    EndpointOptionalWorkspaceIDParam {
  email: string;
}

export interface GetUserCollaborationRequestsEndpointResult
  extends PaginatedResult {
  requests: PublicCollaborationRequestForUser[];
}

export type GetUserCollaborationRequestsEndpoint = Endpoint<
  GetUserCollaborationRequestsEndpointParams,
  GetUserCollaborationRequestsEndpointResult
>;

import {
  CountItemsEndpointResult,
  Endpoint,
  EndpointOptionalWorkspaceIDParam,
} from '../../types.js';

export interface CountUserCollaborationRequestsEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  email: string;
}

export type CountUserCollaborationRequestsEndpoint = Endpoint<
  CountUserCollaborationRequestsEndpointParams,
  CountItemsEndpointResult
>;

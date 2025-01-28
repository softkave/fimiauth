import {PublicSpace} from '../../../definitions/space.js';
import {
  Endpoint,
  EndpointOptionalWorkspaceIDParam,
  PaginatedResult,
  PaginationQuery,
} from '../../types.js';

export interface GetWorkspaceSpacesEndpointParamsBase
  extends EndpointOptionalWorkspaceIDParam {}

export interface GetWorkspaceSpacesEndpointParams
  extends GetWorkspaceSpacesEndpointParamsBase,
    PaginationQuery {}

export interface GetWorkspaceSpacesEndpointResult extends PaginatedResult {
  spaces: PublicSpace[];
}

export type GetWorkspaceSpacesEndpoint = Endpoint<
  GetWorkspaceSpacesEndpointParams,
  GetWorkspaceSpacesEndpointResult
>;

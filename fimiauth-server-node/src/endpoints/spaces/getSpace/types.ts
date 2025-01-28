import {PublicSpace} from '../../../definitions/space.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';

export interface GetSpaceEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  spaceId: string;
}

export interface GetSpaceEndpointResult {
  space: PublicSpace;
}

export type GetSpaceEndpoint = Endpoint<
  GetSpaceEndpointParams,
  GetSpaceEndpointResult
>;

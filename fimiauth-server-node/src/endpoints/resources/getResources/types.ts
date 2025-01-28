import {PublicResourceWrapper} from '../../../definitions/system.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';
import {FetchResourceItem} from '../types.js';

export interface GetResourcesEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  resources: FetchResourceItem[];
}

export interface GetResourcesEndpointResult {
  resources: PublicResourceWrapper[];
}

export type GetResourcesEndpoint = Endpoint<
  GetResourcesEndpointParams,
  GetResourcesEndpointResult
>;

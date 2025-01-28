import {PublicSpace} from '../../../definitions/space.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';

export interface NewSpaceInput {
  name: string;
  description?: string;
}

export interface AddSpaceEndpointParams
  extends EndpointOptionalWorkspaceIDParam,
    NewSpaceInput {}

export interface AddSpaceEndpointResult {
  space: PublicSpace;
}

export type AddSpaceEndpoint = Endpoint<
  AddSpaceEndpointParams,
  AddSpaceEndpointResult
>;

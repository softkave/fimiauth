import {PublicSpace} from '../../../definitions/space.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';
import {NewSpaceInput} from '../addSpace/types.js';

export type UpdateSpaceInput = Partial<NewSpaceInput>;

export interface UpdateSpaceEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  spaceId: string;
  data: UpdateSpaceInput;
}

export interface UpdateSpaceEndpointResult {
  space: PublicSpace;
}

export type UpdateSpaceEndpoint = Endpoint<
  UpdateSpaceEndpointParams,
  UpdateSpaceEndpointResult
>;

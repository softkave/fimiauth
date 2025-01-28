import {LongRunningJobResult} from '../../jobs/types.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';

export interface DeleteSpaceEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  spaceId: string;
}

export type DeleteSpaceEndpoint = Endpoint<
  DeleteSpaceEndpointParams,
  LongRunningJobResult
>;

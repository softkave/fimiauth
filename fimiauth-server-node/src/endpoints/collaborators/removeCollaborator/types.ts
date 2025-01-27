import {LongRunningJobResult} from '../../jobs/types.js';
import {Endpoint, EndpointWorkspaceResourceParam} from '../../types.js';

export interface RemoveCollaboratorEndpointParams
  extends EndpointWorkspaceResourceParam {
  collaboratorId?: string;
}

export type RemoveCollaboratorEndpoint = Endpoint<
  RemoveCollaboratorEndpointParams,
  LongRunningJobResult
>;

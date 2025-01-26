import {EncodedAgentToken} from '../../../definitions/agentToken.js';
import {PublicWorkspace} from '../../../definitions/workspace.js';
import {Endpoint, PaginatedResult, PaginationQuery} from '../../types.js';

export interface GetUserWorkspacesEndpointParams extends PaginationQuery {
  userId: string;
}

export interface IUserWorkspace {
  workspace: PublicWorkspace;
  agentToken: EncodedAgentToken;
}

export interface GetUserWorkspacesEndpointResult extends PaginatedResult {
  workspaces: IUserWorkspace[];
}

export type GetUserWorkspacesEndpoint = Endpoint<
  GetUserWorkspacesEndpointParams,
  GetUserWorkspacesEndpointResult
>;

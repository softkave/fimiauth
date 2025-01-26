import {EncodedAgentToken} from '../../../definitions/agentToken.js';
import {PublicWorkspace} from '../../../definitions/workspace.js';
import {Endpoint} from '../../types.js';

export interface NewWorkspaceInput {
  name: string;
  description?: string;
  userId: string;
}

export type AddWorkspaceEndpointParams = NewWorkspaceInput;

export interface AddWorkspaceEndpointResult {
  workspace: PublicWorkspace;
  agentToken: EncodedAgentToken;
}

export type AddWorkspaceEndpoint = Endpoint<
  AddWorkspaceEndpointParams,
  AddWorkspaceEndpointResult
>;

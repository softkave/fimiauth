import {PublicCollaborationRequestForWorkspace} from '../../../definitions/collaborationRequest.js';
import {Endpoint} from '../../types.js';

export interface UpdateCollaborationRequestInput {
  message?: string;
  expires?: number;
  permissionGroupIds?: string[];
}

export interface UpdateCollaborationRequestEndpointParams {
  requestId: string;
  request: UpdateCollaborationRequestInput;
}

export interface UpdateCollaborationRequestEndpointResult {
  request: PublicCollaborationRequestForWorkspace;
}

export type UpdateCollaborationRequestEndpoint = Endpoint<
  UpdateCollaborationRequestEndpointParams,
  UpdateCollaborationRequestEndpointResult
>;

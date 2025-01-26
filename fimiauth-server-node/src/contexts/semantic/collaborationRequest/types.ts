import {CollaborationRequest} from '../../../definitions/collaborationRequest.js';
import {
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
  SemanticWorkspaceResourceProviderType,
} from '../types.js';

export interface SemanticCollaborationRequestProvider
  extends SemanticWorkspaceResourceProviderType<CollaborationRequest> {
  getManyByEmail(
    workspaceId: string,
    email: string,
    options?: SemanticProviderQueryListParams<CollaborationRequest>
  ): Promise<CollaborationRequest[]>;
  getOneByEmail(
    workspaceId: string,
    email: string,
    opts?: SemanticProviderQueryParams<CollaborationRequest>
  ): Promise<CollaborationRequest | null>;
  countByEmail(
    workspaceId: string,
    email: string,
    opts?: SemanticProviderOpParams
  ): Promise<number>;
}

import {CollaborationRequest} from '../../../definitions/collaborationRequest.js';
import {
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
  SemanticWorkspaceResourceProviderType,
} from '../types.js';

export interface SemanticCollaborationRequestProviderFilter {
  workspaceId: string;
  resourceIdList?: string[];
  excludeResourceIdList?: string[];
  email?: string;
}

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
  getManyByFilter(
    query: SemanticCollaborationRequestProviderFilter,
    options?: SemanticProviderQueryListParams<CollaborationRequest>
  ): Promise<CollaborationRequest[]>;
  countManyByFilter(
    query: SemanticCollaborationRequestProviderFilter,
    opts?: SemanticProviderOpParams
  ): Promise<number>;
}

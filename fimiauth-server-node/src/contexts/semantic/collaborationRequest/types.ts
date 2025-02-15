import {CollaborationRequest} from '../../../definitions/collaborationRequest.js';
import {
  SemanticProviderOpParams,
  SemanticProviderQueryListParams,
  SemanticProviderQueryParams,
  SemanticWorkspaceResourceProviderType,
} from '../types.js';

export interface SemanticCollaborationRequestProviderFilter {
  spaceId: string;
  resourceIdList?: string[];
  excludeResourceIdList?: string[];
  email?: string;
}

export interface SemanticCollaborationRequestProvider
  extends SemanticWorkspaceResourceProviderType<CollaborationRequest> {
  getManyByEmail(
    spaceId: string,
    email: string,
    options?: SemanticProviderQueryListParams<CollaborationRequest>
  ): Promise<CollaborationRequest[]>;
  getOneByEmail(
    spaceId: string,
    email: string,
    opts?: SemanticProviderQueryParams<CollaborationRequest>
  ): Promise<CollaborationRequest | null>;
  countByEmail(
    spaceId: string,
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

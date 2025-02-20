import {FimidaraPermissionAction} from '../../../definitions/permissionItem.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';
import {PermissionItemInputTarget} from '../types.js';

export interface ResolveEntityPermissionItemInput
  extends PermissionItemInputTarget {
  action: FimidaraPermissionAction;
  entityId: string | string[];
}

export interface ResolvedEntityPermissionItem {
  targetId: string;
  action: FimidaraPermissionAction;
  entityId: string;
  access: boolean;
  permittingEntityId?: string;
  permittingTargetId?: string;
}

export interface ResolveEntityPermissionsEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  items: ResolveEntityPermissionItemInput[];
}

export interface ResolveEntityPermissionsEndpointResult {
  items: ResolvedEntityPermissionItem[];
}

export type ResolveEntityPermissionsEndpoint = Endpoint<
  ResolveEntityPermissionsEndpointParams,
  ResolveEntityPermissionsEndpointResult
>;

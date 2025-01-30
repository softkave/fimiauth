import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {ExportedHttpEndpointWithMddocDefinition} from '../types.js';
import {AddPermissionItemsEndpoint} from './addItems/types.js';
import {DeletePermissionItemsEndpoint} from './deleteItems/types.js';
import {ResolveEntityPermissionsEndpoint} from './resolveEntityPermissions/types.js';

export interface PermissionItemInputTarget {
  targetId?: string;
  containerId?: string;
}

export interface ResolvedEntityPermissionItemTarget {
  targetId?: string;
  containerId?: string;
}

export interface PermissionItemInput extends PermissionItemInputTarget {
  targetId: string;
  action: FimidaraPermissionAction;
  access: boolean;
  entityId: string;
}

export type AddPermissionItemsHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<AddPermissionItemsEndpoint>;
export type DeletePermissionItemsHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<DeletePermissionItemsEndpoint>;
export type ResolveEntityPermissionsHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<ResolveEntityPermissionsEndpoint>;

export type PermissionItemsExportedEndpoints = {
  addItems: AddPermissionItemsHttpEndpoint;
  deleteItems: DeletePermissionItemsHttpEndpoint;
  resolveEntityPermissions: ResolveEntityPermissionsHttpEndpoint;
};

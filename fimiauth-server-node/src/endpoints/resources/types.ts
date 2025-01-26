import {FimidaraPermissionAction} from '../../definitions/permissionItem.js';
import {ExportedHttpEndpointWithMddocDefinition} from '../types.js';
import {GetResourcesEndpoint} from './getResources/types.js';

export interface FetchResourceItem {
  resourceId?: string | string[];
  action: FimidaraPermissionAction;
}

export type GetResourcesHttpEndpoint =
  ExportedHttpEndpointWithMddocDefinition<GetResourcesEndpoint>;

export type ResourcesExportedEndpoints = {
  getResources: GetResourcesHttpEndpoint;
};

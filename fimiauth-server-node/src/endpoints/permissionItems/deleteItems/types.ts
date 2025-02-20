import {FimidaraPermissionAction} from '../../../definitions/permissionItem.js';
import {MultipleLongRunningJobResult} from '../../jobs/types.js';
import {Endpoint, EndpointOptionalWorkspaceIDParam} from '../../types.js';
import {PermissionItemInputTarget} from '../types.js';

export type DeletePermissionItemInputTarget =
  Partial<PermissionItemInputTarget>;

export interface DeletePermissionItemInput
  extends DeletePermissionItemInputTarget {
  action?: FimidaraPermissionAction;
  access?: boolean;
  entityId?: string;
}

export interface DeletePermissionItemsEndpointParams
  extends EndpointOptionalWorkspaceIDParam {
  items: DeletePermissionItemInput[];
}

export type DeletePermissionItemsEndpoint = Endpoint<
  DeletePermissionItemsEndpointParams,
  MultipleLongRunningJobResult
>;

export type DeletePermissionItemsCascadeFnsArgs = {
  workspaceId: string;
  permissionItemsIdList: string[];
};

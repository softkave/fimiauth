import {kEndpointConstants} from '../constants.js';

export const kPermissionItemConstants = {
  maxPermissionItemsPerRequest: 1000,
  routes: {
    addItems: `${kEndpointConstants.apiv1}/permissionItems/addItems`,
    deleteItems: `${kEndpointConstants.apiv1}/permissionItems/deleteItems`,
    resolveEntityPermissions: `${kEndpointConstants.apiv1}/permissionItems/resolveEntityPermissions`,
  },
};

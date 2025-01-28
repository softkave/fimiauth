import {kEndpointConstants} from '../constants.js';

export const spaceConstants = {
  routes: {
    addSpace: `${kEndpointConstants.apiv1}/spaces/addSpace`,
    deleteSpace: `${kEndpointConstants.apiv1}/spaces/deleteSpace`,
    getWorkspaceSpaces: `${kEndpointConstants.apiv1}/spaces/getWorkspaceSpaces`,
    countWorkspaceSpaces: `${kEndpointConstants.apiv1}/spaces/countWorkspaceSpaces`,
    updateSpace: `${kEndpointConstants.apiv1}/spaces/updateSpace`,
    getSpace: `${kEndpointConstants.apiv1}/spaces/getSpace`,
  },
};

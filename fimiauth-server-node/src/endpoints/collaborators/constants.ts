import {kEndpointConstants} from '../constants.js';

export const kCollaboratorConstants = {
  routes: {
    addCollaborator: `${kEndpointConstants.apiv1}/collaborators/addCollaborator`,
    getCollaborator: `${kEndpointConstants.apiv1}/collaborators/getCollaborator`,
    getWorkspaceCollaborators: `${kEndpointConstants.apiv1}/collaborators/getWorkspaceCollaborators`,
    countWorkspaceCollaborators: `${kEndpointConstants.apiv1}/collaborators/countWorkspaceCollaborators`,
    removeCollaborator: `${kEndpointConstants.apiv1}/collaborators/removeCollaborator`,
  },
};

import {kEndpointTag} from '../types.js';
import addCollaborator from './addCollaborator/handler.js';
import countWorkspaceCollaborators from './countWorkspaceCollaborators/handler.js';
import {
  countWorkspaceCollaboratorsEndpointDefinition,
  getCollaboratorEndpointDefinition,
  getWorkspaceCollaboratorsEndpointDefinition,
  removeCollaboratorEndpointDefinition,
} from './endpoints.mddoc.js';
import getCollaborator from './getCollaborator/handler.js';
import getWorkspaceCollaborators from './getWorkspaceCollaborators/handler.js';
import removeCollaborator from './removeCollaborator/handler.js';
import {CollaboratorsExportedEndpoints} from './types.js';

export function getCollaboratorsHttpEndpoints() {
  const collaboratorsExportedEndpoints: CollaboratorsExportedEndpoints = {
    addCollaborator: {
      tag: [kEndpointTag.public],
      fn: addCollaborator,
      mddocHttpDefinition: addCollaboratorEndpointDefinition,
    },
    getCollaborator: {
      tag: [kEndpointTag.public],
      fn: getCollaborator,
      mddocHttpDefinition: getCollaboratorEndpointDefinition,
    },
    getWorkspaceCollaborators: {
      tag: [kEndpointTag.public],
      fn: getWorkspaceCollaborators,
      mddocHttpDefinition: getWorkspaceCollaboratorsEndpointDefinition,
    },
    countWorkspaceCollaborators: {
      tag: [kEndpointTag.public],
      fn: countWorkspaceCollaborators,
      mddocHttpDefinition: countWorkspaceCollaboratorsEndpointDefinition,
    },
    removeCollaborator: {
      tag: [kEndpointTag.public],
      fn: removeCollaborator,
      mddocHttpDefinition: removeCollaboratorEndpointDefinition,
    },
  };

  return collaboratorsExportedEndpoints;
}

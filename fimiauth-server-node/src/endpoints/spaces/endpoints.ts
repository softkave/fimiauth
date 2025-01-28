import {kEndpointTag} from '../types.js';
import addSpace from './addSpace/handler.js';
import countWorkspaceSpaces from './countWorkspaceSpaces/handler.js';
import deleteSpace from './deleteSpace/handler.js';
import getSpace from './getSpace/handler.js';
import getWorkspaceSpaces from './getWorkspaceSpaces/handler.js';
import {SpacesExportedEndpoints} from './types.js';
import updateSpace from './updateSpace/handler.js';

export function getSpacesHttpEndpoints() {
  const spacesExportedEndpoints: SpacesExportedEndpoints = {
    addSpace: {
      tag: [kEndpointTag.public],
      fn: addSpace,
      mddocHttpDefinition: addSpaceEndpointDefinition,
    },
    deleteSpace: {
      tag: [kEndpointTag.public],
      fn: deleteSpace,
      mddocHttpDefinition: deleteSpaceEndpointDefinition,
    },
    getSpace: {
      tag: [kEndpointTag.public],
      fn: getSpace,
      mddocHttpDefinition: getSpaceEndpointDefinition,
    },
    getWorkspaceSpaces: {
      tag: [kEndpointTag.public],
      fn: getWorkspaceSpaces,
      mddocHttpDefinition: getWorkspaceSpacesEndpointDefinition,
    },
    countWorkspaceSpaces: {
      tag: [kEndpointTag.public],
      fn: countWorkspaceSpaces,
      mddocHttpDefinition: countWorkspaceSpacesEndpointDefinition,
    },
    updateSpace: {
      tag: [kEndpointTag.public],
      fn: updateSpace,
      mddocHttpDefinition: updateSpaceEndpointDefinition,
    },
  };

  return spacesExportedEndpoints;
}

import {kEndpointConstants} from '../constants.js';

const kResourcesConstants = {
  maxFetchItems: 100,
  routes: {
    getResources: `${kEndpointConstants.apiv1}/resources/getResources`,
  },
};

export default kResourcesConstants;

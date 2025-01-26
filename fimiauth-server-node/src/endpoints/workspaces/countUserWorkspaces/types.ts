import {CountItemsEndpointResult, Endpoint} from '../../types.js';

export type CountUserWorkspacesEndpointParams = {
  userId: string;
};

export type CountUserWorkspacesEndpoint = Endpoint<
  CountUserWorkspacesEndpointParams,
  CountItemsEndpointResult
>;

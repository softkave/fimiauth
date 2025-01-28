import {CountItemsEndpointResult, Endpoint} from '../../types.js';
import {GetWorkspaceSpacesEndpointParamsBase} from '../getWorkspaceSpaces/types.js';

export type CountWorkspaceSpacesEndpointParams =
  GetWorkspaceSpacesEndpointParamsBase;

export type CountWorkspaceSpacesEndpoint = Endpoint<
  CountWorkspaceSpacesEndpointParams,
  CountItemsEndpointResult
>;

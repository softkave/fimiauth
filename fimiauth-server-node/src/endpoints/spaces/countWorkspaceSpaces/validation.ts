import Joi from 'joi';
import {getWorkspaceSpacesBaseJoiSchemaParts} from '../getWorkspaceSpaces/validation.js';
import {CountWorkspaceSpacesEndpointParams} from './types.js';

export const countWorkspaceSpacesJoiSchema =
  Joi.object<CountWorkspaceSpacesEndpointParams>()
    .keys(getWorkspaceSpacesBaseJoiSchemaParts)
    .required();

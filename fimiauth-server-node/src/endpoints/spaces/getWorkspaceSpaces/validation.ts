import Joi from 'joi';
import {JoiSchemaParts} from '../../../utils/types.js';
import {endpointValidationSchemas} from '../../validation.js';
import {
  GetWorkspaceSpacesEndpointParams,
  GetWorkspaceSpacesEndpointParamsBase,
} from './types.js';

export const getWorkspaceSpacesBaseJoiSchemaParts: JoiSchemaParts<GetWorkspaceSpacesEndpointParamsBase> =
  endpointValidationSchemas.optionalWorkspaceIdParts;

export const getWorkspaceSpacesJoiSchema =
  Joi.object<GetWorkspaceSpacesEndpointParams>()
    .keys({
      ...getWorkspaceSpacesBaseJoiSchemaParts,
      ...endpointValidationSchemas.paginationParts,
    })
    .required();

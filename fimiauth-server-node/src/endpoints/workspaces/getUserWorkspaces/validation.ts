import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {endpointValidationSchemas} from '../../validation.js';
import {GetUserWorkspacesEndpointParams} from './types.js';

export const getUserWorkspacesJoiSchema =
  Joi.object<GetUserWorkspacesEndpointParams>()
    .keys({
      ...endpointValidationSchemas.paginationParts,
      userId: kValidationSchemas.resourceId.required(),
    })
    .required();

import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {CountUserWorkspacesEndpointParams} from './types.js';

export const countUserWorkspacesJoiSchema =
  Joi.object<CountUserWorkspacesEndpointParams>()
    .keys({
      userId: kValidationSchemas.resourceId.required(),
    })
    .required();

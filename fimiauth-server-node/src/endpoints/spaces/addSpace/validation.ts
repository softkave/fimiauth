import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {AddSpaceEndpointParams} from './types.js';

export const addSpaceJoiSchema = Joi.object<AddSpaceEndpointParams>()
  .keys({
    workspaceId: kValidationSchemas.resourceId,
    name: kValidationSchemas.name.required(),
    description: kValidationSchemas.description.allow(null),
  })
  .required();

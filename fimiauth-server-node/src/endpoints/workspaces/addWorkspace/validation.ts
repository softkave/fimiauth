import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';

export const addWorkspaceJoiSchema = Joi.object()
  .keys({
    name: kValidationSchemas.name.required(),
    description: kValidationSchemas.description.allow(null),
    userId: kValidationSchemas.resourceId.required(),
  })
  .required();

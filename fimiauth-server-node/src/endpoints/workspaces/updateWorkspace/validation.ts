import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {endpointValidationSchemas} from '../../validation.js';

export const workspaceInputJoiSchema = Joi.object().keys({
  name: kValidationSchemas.name,
  description: kValidationSchemas.description.allow(null),
});

export const updateWorkspaceJoiSchema = Joi.object()
  .keys({
    ...endpointValidationSchemas.optionalWorkspaceIdParts,
    workspace: workspaceInputJoiSchema.required(),
  })
  .required();

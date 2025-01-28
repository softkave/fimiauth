import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {endpointValidationSchemas} from '../../validation.js';

export const getSpaceJoiSchema = Joi.object()
  .keys({
    ...endpointValidationSchemas.optionalWorkspaceIdParts,
    spaceId: kValidationSchemas.resourceId.required(),
  })
  .required();

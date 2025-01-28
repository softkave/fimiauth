import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {UpdateSpaceEndpointParams, UpdateSpaceInput} from './types.js';

export const updateSpaceJoiSchema = Joi.object<UpdateSpaceEndpointParams>()
  .keys({
    spaceId: kValidationSchemas.resourceId.required(),
    data: Joi.object<UpdateSpaceInput>()
      .keys({
        name: kValidationSchemas.name,
        description: kValidationSchemas.description.allow(null),
      })
      .required(),
  })
  .required();

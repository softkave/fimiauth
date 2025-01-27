import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {AddCollaboratorEndpointParams} from './types.js';

export const addCollaboratorJoiSchema =
  Joi.object<AddCollaboratorEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      providedResourceId: kValidationSchemas.resourceId.required(),
    })
    .required();

import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';

export const getCollaboratorJoiSchema = Joi.object()
  .keys({
    collaboratorId: kValidationSchemas.resourceId,
    providedResourceId: kValidationSchemas.providedResourceId,
    workspaceId: kValidationSchemas.resourceId,
  })
  .required();

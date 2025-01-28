import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import kPermissionItemValidationSchemas from '../validation.js';
import {AddPermissionItemsEndpointParams} from './types.js';

export const addPermissionItemsJoiSchema =
  Joi.object<AddPermissionItemsEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      items: kPermissionItemValidationSchemas.itemInputList.required(),
    })
    .required();

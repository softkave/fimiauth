import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {kPermissionItemConstants} from '../constants.js';
import kPermissionItemValidationSchemas from '../validation.js';
import {
  DeletePermissionItemInput,
  DeletePermissionItemsEndpointParams,
} from './types.js';

const itemInput = Joi.object<DeletePermissionItemInput>().keys({
  entityId: kPermissionItemValidationSchemas.entityParts.entityId,
  targetId: kPermissionItemValidationSchemas.targetParts.targetId,
  action: kValidationSchemas.crudActionOrList,
  access: Joi.boolean(),
});

export const deletePermissionItemsJoiSchema =
  Joi.object<DeletePermissionItemsEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      items: Joi.array()
        .items(itemInput)
        .max(kPermissionItemConstants.maxPermissionItemsPerRequest)
        .required(),
    })
    .required();

import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {permissionItemConstants} from '../constants.js';
import permissionItemValidationSchemas from '../validation.js';
import {
  DeletePermissionItemInput,
  DeletePermissionItemsEndpointParams,
} from './types.js';

const itemInput = Joi.object<DeletePermissionItemInput>().keys({
  entityId: permissionItemValidationSchemas.entityParts.entityId,
  targetId: permissionItemValidationSchemas.targetParts.targetId,
  action: kValidationSchemas.crudActionOrList,
  access: Joi.boolean(),
});

export const deletePermissionItemsJoiSchema =
  Joi.object<DeletePermissionItemsEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      items: Joi.array()
        .items(itemInput)
        .max(permissionItemConstants.maxPermissionItemsPerRequest)
        .required(),
    })
    .required();

import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {kPermissionItemConstants} from '../constants.js';
import {PermissionItemInput} from '../types.js';
import kPermissionItemValidationSchemas from '../validation.js';
import {AddPermissionItemsEndpointParams} from './types.js';

const itemInput = Joi.object<PermissionItemInput>().keys({
  targetId: kPermissionItemValidationSchemas.targetParts.targetId.required(),
  action: kValidationSchemas.crudActionOrList.required(),
  access: Joi.boolean().required(),
  entityId: kPermissionItemValidationSchemas.entityParts.entityId.required(),
  containerId: kPermissionItemValidationSchemas.containerId,
});

const itemInputList = Joi.array()
  .items(itemInput)
  .max(kPermissionItemConstants.maxPermissionItemsPerRequest);

export const addPermissionItemsJoiSchema =
  Joi.object<AddPermissionItemsEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      items: itemInputList.required(),
    })
    .required();

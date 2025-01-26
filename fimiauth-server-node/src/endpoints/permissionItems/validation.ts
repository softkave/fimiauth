import Joi from 'joi';
import {getWorkspaceResourceTypeList} from '../../definitions/system.js';
import {kValidationSchemas} from '../../utils/validationUtils.js';
import {kEndpointConstants} from '../constants.js';
import {permissionItemConstants} from './constants.js';
import {PermissionItemInput} from './types.js';

const targetId = kValidationSchemas.resourceId;
const targetType = Joi.string().valid(...getWorkspaceResourceTypeList());
const entityId = kValidationSchemas.resourceId;

// TODO: review max items
const targetParts = {
  targetId: Joi.alternatives().try(
    targetId,
    Joi.array().items(targetId).max(kEndpointConstants.inputListMax)
  ),
  targetType: Joi.alternatives().try(
    targetType,
    Joi.array().items(targetType).max(kEndpointConstants.inputListMax)
  ),
};

const entityParts = {
  entityId: Joi.alternatives().try(
    entityId,
    Joi.array().items(entityId).unique().max(kEndpointConstants.inputListMax)
  ),
};
const itemInput = Joi.object<PermissionItemInput>().keys({
  targetId: targetParts.targetId,
  action: kValidationSchemas.crudActionOrList.required(),
  access: Joi.boolean().required(),
  entityId: entityParts.entityId,
});
const itemInputList = Joi.array()
  .items(itemInput)
  .max(permissionItemConstants.maxPermissionItemsPerRequest);
const itemIds = Joi.array()
  .items(kValidationSchemas.resourceId.required())
  .max(permissionItemConstants.maxPermissionItemsPerRequest)
  .unique();
const publicAccessOp = Joi.object().keys({
  action: kValidationSchemas.crudAction.required(),
  resourceType: kValidationSchemas.resourceType.required(),
});
const publicAccessOpList = Joi.array()
  .items(publicAccessOp)
  .max(permissionItemConstants.maxPermissionItemsPerRequest);

const permissionItemValidationSchemas = {
  itemIds,
  itemInput,
  itemInputList,
  publicAccessOp,
  publicAccessOpList,
  targetParts,
  entityParts,
};

export default permissionItemValidationSchemas;

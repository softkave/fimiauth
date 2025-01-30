import Joi from 'joi';
import {kValidationSchemas} from '../../utils/validationUtils.js';
import {kPermissionItemConstants} from './constants.js';

const targetId = kValidationSchemas.resourceId;
const targetType = Joi.string().max(
  kPermissionItemConstants.maxTargetTypeLength
);
const entityId = kValidationSchemas.resourceId;
const containerId = kValidationSchemas.resourceId;
const entityType = Joi.string().max(
  kPermissionItemConstants.maxEntityTypeLength
);

const targetParts = {
  targetId,
  targetType,
  containerId,
};

const entityParts = {
  entityId,
  entityType,
};

const itemIds = Joi.array()
  .items(kValidationSchemas.resourceId.required())
  .max(kPermissionItemConstants.maxPermissionItemsPerRequest)
  .unique();

const publicAccessOp = Joi.object().keys({
  action: kValidationSchemas.crudAction.required(),
  resourceType: kValidationSchemas.resourceType.required(),
});

const publicAccessOpList = Joi.array()
  .items(publicAccessOp)
  .max(kPermissionItemConstants.maxPermissionItemsPerRequest);

const kPermissionItemValidationSchemas = {
  itemIds,
  publicAccessOp,
  publicAccessOpList,
  targetParts,
  entityParts,
  containerId,
};

export default kPermissionItemValidationSchemas;

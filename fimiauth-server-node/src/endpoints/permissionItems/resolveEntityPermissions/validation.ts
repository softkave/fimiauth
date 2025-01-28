import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import {kPermissionItemConstants} from '../constants.js';
import kPermissionItemValidationSchemas from '../validation.js';
import {
  ResolveEntityPermissionItemInput,
  ResolveEntityPermissionsEndpointParams,
} from './types.js';

const itemInput = Joi.object<ResolveEntityPermissionItemInput>().keys({
  entityId: kPermissionItemValidationSchemas.entityParts.entityId,
  targetId: kPermissionItemValidationSchemas.targetParts.targetId,
  action: kValidationSchemas.crudActionOrList.required(),
});
const itemInputList = Joi.array()
  .items(itemInput)
  .max(kPermissionItemConstants.maxPermissionItemsPerRequest);

export const resolveEntityPermissionsJoiSchema =
  Joi.object<ResolveEntityPermissionsEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      items: itemInputList.required(),
    })
    .required();

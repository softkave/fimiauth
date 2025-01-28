import Joi from 'joi';
import permissionItemValidationSchemas from '../../permissionItems/validation.js';
import {endpointValidationSchemas} from '../../validation.js';
import kPermissionGroupsValidationSchemas from '../validation.js';
import {AssignPermissionGroupsEndpointParams} from './types.js';

export const assignPermissionGroupsJoiSchema =
  Joi.object<AssignPermissionGroupsEndpointParams>()
    .keys({
      ...endpointValidationSchemas.optionalWorkspaceIdParts,
      entityId: permissionItemValidationSchemas.entityParts.entityId.required(),
      permissionGroupId:
        kPermissionGroupsValidationSchemas.pgIdOrList.required(),
    })
    .required();

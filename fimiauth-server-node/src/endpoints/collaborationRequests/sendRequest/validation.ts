import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import kCollabRequestsValidationSchemas from '../validation.js';
import {SendCollaborationRequestEndpointParams} from './types.js';

export const sendCollaborationRequestJoiSchema =
  Joi.object<SendCollaborationRequestEndpointParams>()
    .keys({
      workspaceId: kValidationSchemas.resourceId,
      recipientEmail: kCollabRequestsValidationSchemas.email.required(),
      message: kValidationSchemas.description.allow(null),
      expires: kValidationSchemas.time.allow(null),
      permissionGroupIds: kValidationSchemas.resourceIdList.allow(null),
    })
    .required();

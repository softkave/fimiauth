import Joi from 'joi';
import {endpointValidationSchemas} from '../../validation.js';
import kCollabRequestsValidationSchemas from '../validation.js';
import {GetUserCollaborationRequestsEndpointParams} from './types.js';

export const getUserRequestsJoiSchema =
  Joi.object<GetUserCollaborationRequestsEndpointParams>()
    .keys({
      page: endpointValidationSchemas.page,
      pageSize: endpointValidationSchemas.pageSize,
      email: kCollabRequestsValidationSchemas.email.required(),
    })
    .required();

import Joi from 'joi';
import kCollabRequestsValidationSchemas from '../validation.js';
import {CountUserCollaborationRequestsEndpointParams} from './types.js';

export const countUserRequestsJoiSchema =
  Joi.object<CountUserCollaborationRequestsEndpointParams>()
    .keys({
      email: kCollabRequestsValidationSchemas.email.required(),
    })
    .required();

import Joi from 'joi';

const email = Joi.string().trim().email();

const kCollabRequestsValidationSchemas = {
  email,
};

export default kCollabRequestsValidationSchemas;

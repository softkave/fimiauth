import {Request, Response} from 'express';
import pkg from 'jsonwebtoken';
import {isObject} from 'lodash-es';
import {AnyFn, AnyObject} from 'softkave-js-utils';
import {kUtilsInjectables} from '../contexts/injection/injectables.js';
import {kEndpointConstants} from '../endpoints/constants.js';
import {getPublicErrors} from '../endpoints/utils.js';
import {ServerError} from '../utils/errors.js';
import {
  InvalidCredentialsError,
  CredentialsExpiredError,
} from '../endpoints/errors.js';

const {JsonWebTokenError, NotBeforeError, TokenExpiredError} = pkg;

export function resolveJWTError(err: unknown) {
  if (!isObject(err)) {
    return undefined;
  }

  switch ((err as AnyObject).name) {
    case JsonWebTokenError.name:
    case 'UnauthorizedError':

    // TODO: should this be resolved as invalid?
    // eslint-disable-next-line no-fallthrough
    case NotBeforeError.name:
      return new InvalidCredentialsError();

    case TokenExpiredError.name:
      return new CredentialsExpiredError();

    default:
      return undefined;
  }
}

function handleErrors(err: unknown, req: Request, res: Response, next: AnyFn) {
  if (!err) {
    res.status(kEndpointConstants.httpStatusCode.serverError).send({
      errors: getPublicErrors([new ServerError()]),
    });

    return;
  }

  kUtilsInjectables.logger().error(err);
  const JWTError = resolveJWTError(err);
  if (JWTError) {
    res.status(kEndpointConstants.httpStatusCode.unauthorized).json({
      errors: getPublicErrors(JWTError),
    });
  } else {
    res.status(kEndpointConstants.httpStatusCode.serverError).json({
      errors: getPublicErrors(new ServerError()),
    });
  }
}

export default handleErrors;
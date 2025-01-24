import { isObject } from "lodash-es";

export const kOwnError = Symbol("OwnError");
export const kOwnServerError = Symbol("OwnServerError");

export class OwnError extends Error {
  static isOwnError(error: unknown): error is OwnError {
    return isObject(error) && (error as any)[kOwnError] === true;
  }

  [kOwnError]: true = true;

  constructor(message: string) {
    super(message);
  }
}

export class OwnServerError extends OwnError {
  static isOwnServerError(error: unknown): error is OwnServerError {
    return (
      OwnError.isOwnError(error) && (error as any)[kOwnServerError] === true
    );
  }

  [kOwnServerError]: true = true;
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

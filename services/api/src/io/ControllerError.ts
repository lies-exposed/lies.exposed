import { NotAuthorizedError } from "@liexp/backend/lib/errors/index.js";
import { IOErrorSchema } from "@liexp/io/lib/http/Error/IOError.js";
import { reportIOErrorDetails } from "@liexp/shared/lib/utils/APIError.utils.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import { UnauthorizedError } from "express-jwt";

/**
 * ControllerError is the unified error type for all controller operations.
 * All provider errors (DBError, JWTError, SpaceError, etc.) extend IOError,
 * so we use IOError as the base type for simplicity.
 */
export type ControllerError = IOError;

/**
 * Converts an unknown error to a ControllerError (IOError).
 * Handles express-jwt UnauthorizedError specially.
 */
export const toControllerError = (e: unknown): ControllerError => {
  // Already an IOError instance
  if (e instanceof IOError) {
    return e;
  }

  // Check if it matches IOErrorSchema (plain object that looks like IOError)
  if (Schema.is(IOErrorSchema)(e)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new IOError(e.message, e.details as any);
  }

  // Handle express-jwt UnauthorizedError
  if (e instanceof UnauthorizedError) {
    return new NotAuthorizedError(e.message, {
      kind: "ClientError",
      status: "401",
      meta: e.stack ? [e.stack] : undefined,
    });
  }

  // Handle generic Error instances
  if (e instanceof Error) {
    return new IOError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: e.stack ? [e.stack] : undefined,
    });
  }

  // Fallback for unknown error types
  const anyE = e as Record<string, unknown>;
  return new IOError(
    typeof anyE?.message === "string" ? anyE.message : "Unknown Error",
    {
      kind: "ServerError",
      status: "500",
      meta: [JSON.stringify(e)],
    },
  );
};

/**
 * Formats a ControllerError for logging.
 */
export const report = (err: ControllerError): string => {
  return `[${err.name}] ${err.message}:\n${reportIOErrorDetails(err.details)}`;
};

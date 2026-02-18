import { IOErrorSchema } from "@liexp/io/lib/http/Error/IOError.js";
import {
  fromIOError,
  reportIOErrorDetails,
} from "@liexp/shared/lib/utils/APIError.utils.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import { type NextFunction, type Request, type Response } from "express";
import { UnauthorizedError } from "express-jwt";
import { type LoggerContext } from "../../context/logger.context.js";
import { NotAuthorizedError } from "../../errors/NotAuthorizedError.js";

/**
 * Normalises any thrown value to an IOError.
 *
 * Priority order:
 *  1. Already an IOError (or subclass) — return as-is.
 *  2. IOError-shaped plain object — reconstructs an IOError instance.
 *     (Catches cross-module-boundary cases where instanceof fails.)
 *  3. express-jwt UnauthorizedError — maps to NotAuthorizedError (401).
 *  4. Generic Error — wraps as 500 ServerError.
 *  5. Unknown value — wraps as 500 ServerError with JSON-serialised payload.
 */
export const toControllerError = (e: unknown): IOError => {
  if (e instanceof IOError) {
    return e;
  }

  if (Schema.is(IOErrorSchema)(e)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new IOError(e.message, e.details as any);
  }

  if (e instanceof UnauthorizedError) {
    return new NotAuthorizedError(e.message, {
      kind: "ClientError",
      status: "401",
      meta: e.stack ? [e.stack] : undefined,
    });
  }

  if (e instanceof Error) {
    return new IOError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: e.stack ? [e.stack] : undefined,
    });
  }

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
 * Formats a controller error for logging.
 */
export const report = (err: IOError): string =>
  `[${err.name}] ${err.message}:\n${reportIOErrorDetails(err.details)}`;

/**
 * Express error-handler middleware.
 * Converts any thrown value to an IOError then serialises it as an APIError response.
 */
export const errorHandler =
  (ctx: LoggerContext) =>
  (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
    ctx.logger.error.log(
      "An error occurred during %s %s %O",
      req.method,
      req.url,
      err,
    );

    const apiError = fromIOError(toControllerError(err));
    res.status(apiError.status).send(apiError);
  };

import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { toAPIError } from "@liexp/shared/lib/utils/APIError.utils.js";
import { type NextFunction, type Request, type Response } from "express";
import { toControllerError } from "#io/ControllerError.js";

/**
 * Express error handler middleware.
 * Converts any error to an APIError and sends it as the response.
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

    const apiError = toAPIError(toControllerError(err));
    res.status(apiError.status).send(apiError);
  };

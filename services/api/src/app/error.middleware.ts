import { type LoggerContext } from "@liexp/backend/lib/context/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { toAPIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type NextFunction, type Request, type Response } from "express";
import {
  type ControllerError,
  toAPIError as fromControllerToAPIError,
  toControllerError,
} from "#io/ControllerError.js";

export const errorHandler =
  (ctx: LoggerContext) =>
  (
    err: ControllerError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    return pipe(
      fp.IOE.tryCatch(() => {
        ctx.logger.error.log(
          "An error occurred during %s %s %O",
          req.method,
          req.url,
          err,
        );

        return pipe(err, toControllerError, fromControllerToAPIError);
      }, toAPIError),
      fp.IOE.fold(
        (e) => () => {
          res.status(e.status).send(e);
        },
        (e) => () => {
          res.status(e.status).send(e);
        },
      ),
    )();
  };

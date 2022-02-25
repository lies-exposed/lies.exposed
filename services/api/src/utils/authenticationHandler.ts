import * as logger from "@liexp/core/logger";
import * as express from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { NotAuthorizedError } from "@io/ControllerError";

const HeadersWithAuthorization = t.strict(
  {
    authorization: t.string,
  },
  "HeadersWithAuthorization"
);

export const authenticationHandler: (
  logger: logger.Logger
) => express.RequestHandler = (l) => (req, _res, next) => {
  const decodedHeaders = HeadersWithAuthorization.decode(req.headers);

  l.debug.log("Decoded headers errors %O", PathReporter.report(decodedHeaders));

  return pipe(
    decodedHeaders,
    E.mapLeft(() => NotAuthorizedError()),
    E.fold(
      (e) => next(e),
      (d) => {
        l.debug.log("Calling next handler...");
        next();
      }
    )
  );
};

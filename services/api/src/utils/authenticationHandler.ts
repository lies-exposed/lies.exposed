import * as logger from "@liexp/core/logger";
import { UserPermission } from "@liexp/shared/io/http/User";
import { JWTClient, JWTError } from "@liexp/shared/providers/jwt/JWTClient";
import * as express from "express";
import * as IOE from "fp-ts/lib/IOEither";
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
  { logger, jwt }: { logger: logger.Logger; jwt: JWTClient },
  perms: UserPermission[]
) => express.RequestHandler =
  ({ logger, jwt }, perms) =>
  (req, _res, next) => {
    const headerKeys = Object.keys(req.headers);
    logger.debug.log(`Checking headers %O for authorization`, headerKeys);
    const decodedHeaders = HeadersWithAuthorization.decode(req.headers);

    logger.debug.log(
      "Decoded headers errors %O",
      PathReporter.report(decodedHeaders)
    );

    return pipe(
      decodedHeaders,
      IOE.fromEither,
      IOE.mapLeft(() => NotAuthorizedError()),
      IOE.chain((s) => jwt.verifyUser(s.authorization)),
      IOE.filterOrElse(
        (u) => perms.every((p) => u.permissions.includes(p)),
        (p) =>
          new JWTError(`The access token doesn't have the needed permissions`, {
            kind: "ClientError",
            status: "401",
            meta: [
              `Token permissions: [${p.permissions.join(", ")}]`,
              `Route permissions: [${perms.join(", ")}]`,
            ],
          })
      ),
      IOE.fold(
        (e) => () => next(e),
        (d) => () => {
          logger.debug.log("Calling next handler...");
          next();
        }
      )
    )();
  };

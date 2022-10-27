import * as logger from "@liexp/core/logger";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionRead,
  UserPermission,
} from "@liexp/shared/io/http/User";
import { JWTClient, JWTError } from "@liexp/shared/providers/jwt/JWTClient";
import * as express from "express";
import * as IOE from "fp-ts/IOEither";
import { pipe } from "fp-ts/function";
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
        (u) => {
          if (perms.includes(EventSuggestionRead.value)) {
            return u.permissions.some((p) => [
              AdminCreate.value,
              AdminEdit.value,
              AdminDelete.value,
              AdminRead.value,
              EventSuggestionRead.value,
            ]);
          }
          if (perms.includes("event-suggestion:create")) {
            return u.permissions.some((p) => [
              "admin:create",
              "event-suggestion:read",
            ]);
          }

          if (perms.length === 0) {
            return true;
          }
          return perms.some((p) => u.permissions.includes(p));
        },
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
        (user) => () => {
          logger.debug.log("Calling next handler with user %s", user.id);
          req.user = user;
          next();
        }
      )
    )();
  };

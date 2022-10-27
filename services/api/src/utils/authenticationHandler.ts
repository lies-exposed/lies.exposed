import { IncomingHttpHeaders } from "http";
import * as logger from "@liexp/core/logger";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead,
  User,
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

interface AuthenticationContext {
  logger: logger.Logger;
  jwt: JWTClient;
}

export const decodeUserFromHeaders =
  ({ logger, jwt }: AuthenticationContext) =>
  (
    headers: IncomingHttpHeaders,
    routePerms: UserPermission[]
  ): IOE.IOEither<JWTError, User> => {
    const decodedHeaders = HeadersWithAuthorization.decode(headers);

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
          if (routePerms.length === 0) {
            return true;
          }

          const perms: UserPermission[] = [AdminDelete.value];

          if (routePerms.includes(AdminDelete.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }
          perms.push(AdminEdit.value);
          if (routePerms.includes(AdminEdit.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }
          perms.push(AdminCreate.value);
          if (routePerms.includes(AdminCreate.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(AdminRead.value);
          if (routePerms.includes(AdminRead.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(EventSuggestionEdit.value);
          if (routePerms.includes(EventSuggestionEdit.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(EventSuggestionCreate.value);
          if (routePerms.includes(EventSuggestionCreate.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(EventSuggestionRead.value);
          if (routePerms.includes(EventSuggestionRead.value)) {
            return perms.some((p) => u.permissions.includes(p));
          }

          return routePerms.some((p) => u.permissions.includes(p));
        },
        (p) =>
          new JWTError(`The access token doesn't have the needed permissions`, {
            kind: "ClientError",
            status: "401",
            meta: [
              `Token permissions: [${p.permissions.join(", ")}]`,
              `Route permissions: [${routePerms.join(", ")}]`,
            ],
          })
      )
    );
  };

export const authenticationHandler: (
  ctx: AuthenticationContext,
  routePerms: UserPermission[]
) => express.RequestHandler = (ctx, routePerms) => (req, _res, next) => {
  const headerKeys = Object.keys(req.headers);
  ctx.logger.debug.log(`Checking headers %O for authorization`, headerKeys);

  return pipe(
    decodeUserFromHeaders(ctx)(req.headers, routePerms),
    IOE.fold(
      (e) => () => next(e),
      (user) => () => {
        ctx.logger.debug.log("Calling next handler with user %s", user.id);
        req.user = user;
        next();
      }
    )
  )();
};

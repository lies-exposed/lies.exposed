import {
  type JWTProvider,
  JWTError,
} from "@liexp/backend/lib/providers/jwt/jwt.provider";
import type * as logger from "@liexp/core/lib/logger";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead,
  type User,
  type UserPermission,
} from "@liexp/shared/lib/io/http/User";
import type * as express from "express";
import { type IO } from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { NotAuthorizedError } from "@io/ControllerError";

const HeadersWithAuthorization = t.strict(
  {
    authorization: t.string,
  },
  "HeadersWithAuthorization",
);

interface AuthenticationContext {
  logger: logger.Logger;
  jwt: JWTProvider;
}

const decodeUserFromRequest =
  ({ logger, jwt }: AuthenticationContext) =>
  (
    req: Express.Request,
    routePerms: UserPermission[],
  ): IOE.IOEither<JWTError, User> => {
    // const headerKeys = Object.keys(req.headers);
    // logger.debug.log(`Checking headers %O for authorization`, headerKeys);
    const decodedHeaders = HeadersWithAuthorization.decode(req.headers);

    logger.debug.log(
      "Decoded headers errors %O",
      PathReporter.report(decodedHeaders),
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
          }),
      ),
    );
  };

const decodeNullableUser =
  ({ logger, jwt }: AuthenticationContext) =>
  (req: Express.Request, routePerms: UserPermission[]): IO<User | null> => {
    return pipe(
      decodeUserFromRequest({ logger, jwt })(req, routePerms),
      IOE.mapLeft(() => null),
      IOE.toUnion,
    );
  };

export const RequestDecoder = {
  decodeUserFromRequest,
  decodeNullableUser,
};

export const authenticationHandler: (
  ctx: AuthenticationContext,
  routePerms: UserPermission[],
) => express.RequestHandler = (ctx, routePerms) => (req, _res, next) => {
  pipe(
    decodeUserFromRequest(ctx)(req, routePerms),
    IOE.fold(
      (e) => () => {
        next(e);
      },
      (user) => () => {
        // ctx.logger.debug.log("Calling next handler with user %s", user.id);
        req.user = user;
        next();
      },
    ),
  )();
};

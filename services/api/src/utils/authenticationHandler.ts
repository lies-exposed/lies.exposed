import { toNotAuthorizedError } from "@liexp/backend/lib/errors/NotAuthorizedError.js";
import {
  type JWTProvider,
  JWTError,
} from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import type * as logger from "@liexp/core/lib/logger/index.js";
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
} from "@liexp/shared/lib/io/http/User.js";
import type * as express from "express";
import { type IO } from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";

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
  (req: Express.Request, routePerms: UserPermission[]) =>
  ({ logger, jwt }: AuthenticationContext): IOE.IOEither<JWTError, User> => {
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
      IOE.mapLeft(() => toNotAuthorizedError()),
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

          return routePerms.every((p) => u.permissions.includes(p));
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
  <C extends AuthenticationContext>(
    req: Express.Request,
    routePerms: UserPermission[],
  ) =>
  ({ logger, jwt }: C): IO<User | null> => {
    return pipe(
      decodeUserFromRequest(req, routePerms)({ logger, jwt }),
      IOE.mapLeft(() => null),
      IOE.toUnion,
    );
  };

export const RequestDecoder = {
  decodeUserFromRequest,
  decodeNullableUser,
};

export const authenticationHandler =
  (routePerms: UserPermission[]) =>
  (ctx: AuthenticationContext): express.RequestHandler =>
  (req, _res, next) => {
    pipe(
      decodeUserFromRequest(req, routePerms)(ctx),
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

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
import { Schema } from "effect";
import type * as express from "express";
import { type IO } from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";

const HeadersWithAuthorization = Schema.Struct({
  authorization: Schema.String,
}).annotations({ title: "HeadersWithAuthorization" });

interface AuthenticationContext {
  logger: logger.Logger;
  jwt: JWTProvider;
}

const decodeUserFromRequest =
  (req: Express.Request, routePerms: UserPermission[]) =>
  ({ logger, jwt }: AuthenticationContext): IOE.IOEither<JWTError, User> => {
    // const headerKeys = Object.keys(req.headers);
    // logger.debug.log(`Checking headers %O for authorization`, headerKeys);
    const decodedHeaders = Schema.decodeUnknownEither(HeadersWithAuthorization)(
      req.headers,
    );

    return pipe(
      decodedHeaders,
      IOE.fromEither,
      IOE.mapLeft((e) => toNotAuthorizedError()),
      IOE.chain((s) => jwt.verifyUser(s.authorization)),
      IOE.filterOrElse(
        (u) => {
          if (routePerms.length === 0) {
            return true;
          }

          const perms: UserPermission[] = [AdminDelete.literals[0]];

          if (routePerms.includes(AdminDelete.literals[0])) {
            return perms.some((p) => u.permissions.includes(p));
          }
          perms.push(AdminEdit.literals[0]);
          if (routePerms.includes(AdminEdit.literals[0])) {
            return perms.some((p) => u.permissions.includes(p));
          }
          perms.push(AdminCreate.literals[0]);
          if (routePerms.includes(AdminCreate.literals[0])) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(AdminRead.literals[0]);
          if (routePerms.includes(AdminRead.literals[0])) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(EventSuggestionEdit.literals[0]);
          if (routePerms.includes(EventSuggestionEdit.literals[0])) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(EventSuggestionCreate.literals[0]);
          if (routePerms.includes(EventSuggestionCreate.literals[0])) {
            return perms.some((p) => u.permissions.includes(p));
          }

          perms.push(EventSuggestionRead.literals[0]);
          if (routePerms.includes(EventSuggestionRead.literals[0])) {
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

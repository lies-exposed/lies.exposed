import { pipe } from "@liexp/core/lib/fp/index.js";
import { type AuthUser } from "@liexp/shared/lib/io/http/auth/AuthUser.js";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  type AuthPermission,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead,
} from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type ServiceClient } from "@liexp/shared/lib/io/http/auth/service-client/ServiceClient.js";
import { Schema } from "effect";
import { type IO } from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import { type JWTProviderContext } from "../../context/jwt.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { toNotAuthorizedError } from "../../errors/NotAuthorizedError.js";
import { JWTError } from "../../providers/jwt/jwt.provider.js";

const HeadersWithAuthorization = Schema.Struct({
  authorization: Schema.String,
}).annotations({ title: "HeadersWithAuthorization" });

const decodeUserFromRequest =
  <C extends LoggerContext & JWTProviderContext>(
    req: Express.Request,
    routePerms: AuthPermission[],
  ) =>
  ({ logger: _logger, jwt }: C): IOE.IOEither<JWTError, AuthUser> => {
    // const headerKeys = Object.keys(req.headers);
    // logger.debug.log(`Checking headers %O for authorization`, headerKeys);
    const decodedHeaders = Schema.decodeUnknownEither(HeadersWithAuthorization)(
      req.headers as unknown,
    );

    return pipe(
      decodedHeaders,
      IOE.fromEither,
      IOE.mapLeft((_e) => toNotAuthorizedError()),
      IOE.chain((s) => jwt.verifyUser(s.authorization)),
      IOE.filterOrElse(
        (u) => {
          if (routePerms.length === 0) {
            return true;
          }

          const perms: AuthPermission[] = [AdminDelete.literals[0]];

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
  <C extends LoggerContext & JWTProviderContext>(
    req: Express.Request,
    routePerms: AuthPermission[],
  ) =>
  ({ logger, jwt }: C): IO<AuthUser | null> => {
    return pipe(
      decodeUserFromRequest(req, routePerms)({ logger, jwt }),
      IOE.mapLeft(() => null),
      IOE.toUnion,
    );
  };

const decodeServiceClientFromRequest =
  <C extends LoggerContext & JWTProviderContext>(
    req: Express.Request,
    routePerms: AuthPermission[],
  ) =>
  ({ logger: _logger, jwt }: C): IOE.IOEither<JWTError, ServiceClient> => {
    const decodedHeaders = Schema.decodeUnknownEither(HeadersWithAuthorization)(
      req.headers as unknown,
    );

    return pipe(
      decodedHeaders,
      IOE.fromEither,
      IOE.mapLeft((_e) => toNotAuthorizedError()),
      IOE.chain((s) => jwt.verifyClient(s.authorization)),
      IOE.filterOrElse(
        (client) => {
          if (routePerms.length === 0) {
            return true;
          }

          // Check if service client has all required permissions
          return routePerms.every((p) => client.permissions.includes(p));
        },
        (client) =>
          new JWTError(
            "The service client doesn't have the needed permissions",
            {
              kind: "ClientError",
              status: "401",
              meta: [
                `Client permissions: [${client.permissions.join(", ")}]`,
                `Route permissions: [${routePerms.join(", ")}]`,
              ],
            },
          ),
      ),
    );
  };

const decodeNullableServiceClient =
  <C extends LoggerContext & JWTProviderContext>(
    req: Express.Request,
    routePerms: AuthPermission[],
  ) =>
  ({ logger, jwt }: C): IO<ServiceClient | null> => {
    return pipe(
      decodeServiceClientFromRequest(req, routePerms)({ logger, jwt }),
      IOE.mapLeft(() => null),
      IOE.toUnion,
    );
  };

// Helper method that tries to decode either a user or service client
// This is useful for endpoints that accept both types of authentication
const decodeUserOrServiceClient =
  <C extends LoggerContext & JWTProviderContext>(
    req: Express.Request,
    routePerms: AuthPermission[],
  ) =>
  (ctx: C): IOE.IOEither<JWTError, AuthUser | ServiceClient> => {
    return pipe(
      decodeUserFromRequest(req, routePerms)(ctx),
      IOE.orElse(() =>
        pipe(
          decodeServiceClientFromRequest(req, routePerms)(ctx),
          IOE.map((client): AuthUser | ServiceClient => client),
        ),
      ),
    );
  };

export const RequestDecoder = {
  decodeUserFromRequest,
  decodeNullableUser,
  decodeServiceClientFromRequest,
  decodeNullableServiceClient,
  decodeUserOrServiceClient,
};

import { toNotAuthorizedError } from "@liexp/backend/lib/errors/NotAuthorizedError.js";
import {
  type JWTProvider,
  JWTError,
} from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import type * as logger from "@liexp/core/lib/logger/index.js";
import { ServiceClient } from "@liexp/shared/lib/io/http/auth/service-client/ServiceClient.js";
import { type AuthPermission } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { Schema } from "effect";
import type * as express from "express";
import { type IO } from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";

const HeadersWithAuthorization = Schema.Struct({
  authorization: Schema.String,
}).annotations({ title: "HeadersWithAuthorization" });

interface ServiceAuthenticationContext {
  logger: logger.Logger;
  jwt: JWTProvider;
}

const decodeServiceClientFromRequest =
  (req: Express.Request, routePerms: AuthPermission[]) =>
  ({
    logger: _logger,
    jwt,
  }: ServiceAuthenticationContext): IOE.IOEither<JWTError, typeof ServiceClient.Type> => {
    const decodedHeaders = Schema.decodeUnknownEither(HeadersWithAuthorization)(
      req.headers,
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
          new JWTError(`The service client doesn't have the needed permissions`, {
            kind: "ClientError",
            status: "401",
            meta: [
              `Client permissions: [${client.permissions.join(", ")}]`,
              `Route permissions: [${routePerms.join(", ")}]`,
            ],
          }),
      ),
    );
  };

const decodeNullableServiceClient =
  <C extends ServiceAuthenticationContext>(
    req: Express.Request,
    routePerms: AuthPermission[],
  ) =>
  ({ logger, jwt }: C): IO<typeof ServiceClient.Type | null> => {
    return pipe(
      decodeServiceClientFromRequest(req, routePerms)({ logger, jwt }),
      IOE.mapLeft(() => null),
      IOE.toUnion,
    );
  };

export const ServiceRequestDecoder = {
  decodeServiceClientFromRequest,
  decodeNullableServiceClient,
};

export const serviceAuthenticationHandler =
  (routePerms: AuthPermission[]) =>
  (ctx: ServiceAuthenticationContext): express.RequestHandler =>
  (req, _res, next) => {
    pipe(
      decodeServiceClientFromRequest(req, routePerms)(ctx),
      IOE.fold(
        (e) => () => {
          next(e);
        },
        (serviceClient) => () => {
          // ctx.logger.debug.log("Calling next handler with service client %s", serviceClient.id);
          (req as any).serviceClient = serviceClient;
          next();
        },
      ),
    )();
  };

// Type extension for Express Request
declare global {
  namespace Express {
    interface Request {
      serviceClient?: typeof ServiceClient.Type;
    }
  }
}
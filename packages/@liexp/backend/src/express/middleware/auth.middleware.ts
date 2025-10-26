import { pipe } from "@liexp/core/lib/fp/index.js";
import { type AuthUser } from "@liexp/shared/lib/io/http/auth/AuthUser.js";
import { type AuthPermission } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type ServiceClient } from "@liexp/shared/lib/io/http/auth/service-client/ServiceClient.js";
import { addYears } from "date-fns";
import type * as express from "express";
import * as IOE from "fp-ts/lib/IOEither.js";
import { type JWTProviderContext } from "../../context/jwt.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { RequestDecoder } from "../decoders/request.decoder.js";

// Convert ServiceClient to AuthUser format with default email
const serviceClientToAuthUser = (serviceClient: ServiceClient): AuthUser => ({
  id: serviceClient.userId,
  email: `${serviceClient.id}@lies.exposed`,
  permissions: serviceClient.permissions,
  iat: Math.floor(Date.now() / 1000),
  exp: addYears(Date.now(), 1).getTime(),
});

export const authenticationHandler =
  <C extends LoggerContext & JWTProviderContext>(
    routePerms: AuthPermission[],
  ) =>
  (ctx: C): express.RequestHandler =>
  (req, _res, next) => {
    pipe(
      RequestDecoder.decodeUserOrServiceClient(req, routePerms)(ctx),
      IOE.fold(
        (e) => () => {
          next(e);
        },
        (userOrServiceClient) => () => {
          // Convert ServiceClient to AuthUser format if needed
          const user: AuthUser =
            "userId" in userOrServiceClient
              ? serviceClientToAuthUser(userOrServiceClient)
              : userOrServiceClient;

          // ctx.logger.debug.log("Calling next handler with user %s", user.id);
          (req as express.Request & { user: AuthUser }).user = user;
          next();
        },
      ),
    )();
  };

import type * as logger from "@liexp/core/lib/logger/index.js";
import { type ServiceClient } from "@liexp/shared/lib/io/http/auth/service-client/ServiceClient.js";
import { type AuthPermission } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as IO from "fp-ts/lib/IO.js";
import { type JWTProvider } from "./jwt/jwt.provider.js";

export interface ServiceClientConfig {
  id: UUID;
  userId: UUID;
  permissions: AuthPermission[];
}

export interface M2MTokenContext {
  jwt: JWTProvider;
  logger: logger.Logger;
}

/**
 * Build a ServiceClient payload from configuration
 * Pure function that constructs the ServiceClient object
 */
export const buildServiceClientPayload = (
  config: ServiceClientConfig,
): ServiceClient => {
  return {
    id: config.id,
    userId: config.userId,
    permissions: config.permissions,
  };
};

/**
 * Get a signed ServiceClient JWT token
 * This uses the JWT provider to sign the ServiceClient payload
 * The token can be cached since it's valid for 365 days
 */
export const getServiceClientToken =
  (ctx: M2MTokenContext) =>
  (config: ServiceClientConfig): IO.IO<string> => {
    const serviceClient = buildServiceClientPayload(config);

    ctx.logger.debug.log(
      "Signing ServiceClient token for id: %s",
      serviceClient.id,
    );

    return ctx.jwt.signClient(serviceClient);
  };

/**
 * Create a cached M2M token provider
 * The token is generated once and reused (valid for 365 days)
 * Useful for service-to-service authentication where the same token can be reused
 */
export interface M2MTokenProvider {
  getToken: () => IO.IO<string>;
  invalidateCache: () => void;
}

export const makeM2MTokenProvider = (
  ctx: M2MTokenContext,
  config: ServiceClientConfig,
): M2MTokenProvider => {
  let cachedToken: string | null = null;

  return {
    getToken: () => {
      if (cachedToken !== null) {
        ctx.logger.debug.log("Using cached M2M token");
        return IO.of(cachedToken);
      }

      ctx.logger.debug.log("Generating new M2M token");
      return IO.map((token: string) => {
        cachedToken = token;
        return token;
      })(getServiceClientToken(ctx)(config));
    },
    invalidateCache: () => {
      ctx.logger.debug.log("Invalidating M2M token cache");
      cachedToken = null;
    },
  };
};

import { makeAgentClient } from "@liexp/backend/lib/clients/agent.http.client.js";
import { type ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { makeM2MTokenProvider } from "@liexp/backend/lib/providers/m2mToken.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type AdminProxyENV } from "../io/ENV.js";

type TEControllerError<A> = TaskEither<ServerError, A>;

export interface AdminProxyContext {
  logger: ReturnType<typeof GetLogger>;
  jwt: ReturnType<typeof GetJWTProvider>;
  m2m: ReturnType<typeof makeM2MTokenProvider>;
  agent: ReturnType<typeof makeAgentClient>;
  env: AdminProxyENV;
}

/**
 * Create AdminProxyContext from environment
 *
 * Initializes:
 * - Logger for admin-proxy namespace
 * - JWT provider with shared secret
 * - M2M token provider for ServiceClient auth
 * - Agent HTTP client with M2M auth
 */
export const makeAdminProxyContext = (
  env: AdminProxyENV,
): TEControllerError<AdminProxyContext> => {
  const logger = GetLogger("admin-proxy");

  logger.debug.log("Initializing admin proxy context with env: %O", {
    SERVER_PORT: env.SERVER_PORT,
    SERVER_HOST: env.SERVER_HOST,
    AGENT_URL: env.AGENT_API_URL,
    SERVICE_CLIENT_ID: env.SERVICE_CLIENT_ID,
    JWT_SECRET: "***",
  });

  return pipe(
    TE.Do,
    TE.bind("jwt", () =>
      pipe(
        GetJWTProvider({
          secret: env.JWT_SECRET,
          logger,
        }),
        TE.right,
      ),
    ),
    TE.bind("m2m", ({ jwt }) =>
      pipe(
        makeM2MTokenProvider(
          { jwt, logger },
          {
            id: env.SERVICE_CLIENT_ID,
            userId: env.SERVICE_CLIENT_USER_ID,
            permissions: [...env.SERVICE_CLIENT_PERMISSIONS],
          },
        ),
        TE.right,
      ),
    ),
    TE.bind("agent", ({ jwt }) =>
      pipe(
        makeAgentClient({
          baseURL: env.AGENT_API_URL,
          jwt,
          logger,
          getPayload: () => ({
            id: env.SERVICE_CLIENT_ID,
            userId: env.SERVICE_CLIENT_USER_ID,
            permissions: [...env.SERVICE_CLIENT_PERMISSIONS],
          }),
        }),
        TE.right,
      ),
    ),
    TE.map(({ jwt, m2m, agent }) => ({
      logger,
      jwt,
      m2m,
      agent,
      env,
    })),
  );
};

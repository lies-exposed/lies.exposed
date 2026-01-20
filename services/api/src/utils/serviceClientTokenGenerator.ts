import { type JWTProviderContext } from "@liexp/backend/lib/context/jwt.context.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import {
  AdminRead,
  MCPToolsAccess,
  type AuthPermission,
} from "@liexp/io/lib/http/auth/permissions/index.js";
import { type ServiceClient } from "@liexp/io/lib/http/auth/service-client/ServiceClient.js";
import * as IO from "fp-ts/lib/IO.js";
import { pipe } from "fp-ts/lib/function.js";

export const createServiceClientToken =
  <C extends JWTProviderContext>(
    serviceName: string,
    permissions: AuthPermission[],
  ) =>
  (ctx: C): IO.IO<{ serviceClient: ServiceClient; token: string }> => {
    return pipe(
      IO.of({
        id: uuid(),
        userId: uuid(),
        email: `${serviceName}@lies.exposed`,
        permissions,
      } as ServiceClient),
      IO.chain((serviceClient) =>
        pipe(
          ctx.jwt.signClient(serviceClient),
          IO.map((token) => ({ serviceClient, token })),
        ),
      ),
    );
  };

// Utility function to create a service client for agent service
export const createAgentServiceClient = (ctx: JWTProviderContext) =>
  createServiceClientToken("agent", [
    AdminRead.literals[0],
    MCPToolsAccess.literals[0],
  ])(ctx);

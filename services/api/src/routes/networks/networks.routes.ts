import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeEditNetworkRoute } from "./editNetwork.controller.js";
import { MakeGetNetworkRoute } from "./getNetwork.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeNetworksRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  router.use(
    "/networks",
    makeCacheMiddleware(ctx.redis, { ttl: 300, keyPrefix: "cache:networks" }),
  );
  MakeGetNetworkRoute(router, ctx);
  MakeEditNetworkRoute(router, ctx);
};

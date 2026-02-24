import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeGetStatsRoute } from "./getStats.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeStatsRoutes = (router: Router, ctx: ServerContext): void => {
  router.use(
    "/stats",
    makeCacheMiddleware(ctx.redis, { ttl: 300, keyPrefix: "cache:stats" }),
  );
  MakeGetStatsRoute(router, ctx);
};

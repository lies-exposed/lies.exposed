import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeGetNationRoute } from "./getNation.controller.js";
import { MakeListNationRoute } from "./listNation.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeNationRoutes = (router: Router, ctx: ServerContext): void => {
  router.use(
    "/nations",
    makeCacheMiddleware(ctx.redis, { ttl: 3600, keyPrefix: "cache:nations" }),
  );
  MakeGetNationRoute(router, ctx);
  MakeListNationRoute(router, ctx);
};

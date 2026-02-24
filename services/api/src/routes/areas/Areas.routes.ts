import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeCreateAreaRoute } from "./createArea.controller.js";
import { MakeDeleteAreaRoute } from "./deleteArea.controller.js";
import { MakeEditAreaRoute } from "./editArea.controller.js";
import { MakeGetAreaRoute } from "./getArea.controller.js";
import { MakeListAreaRoute } from "./listArea.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeAreasRoutes = (router: Router, ctx: ServerContext): void => {
  router.use(
    "/areas",
    makeCacheMiddleware(ctx.redis, { ttl: 3600, keyPrefix: "cache:areas" }),
  );
  MakeCreateAreaRoute(router, ctx);
  MakeEditAreaRoute(router, ctx);
  MakeGetAreaRoute(router, ctx);
  MakeListAreaRoute(router, ctx);
  MakeDeleteAreaRoute(router, ctx);
};

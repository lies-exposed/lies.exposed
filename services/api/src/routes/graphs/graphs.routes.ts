import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeCreateGraphRoute } from "./createGraph.controller.js";
import { MakeEditFlowGraphRoute } from "./editFlowGraph.controller.js";
import { MakeEditGraphRoute } from "./editGraph.controller.js";
import { MakeGetFlowGraphRoute } from "./getFlowGraph.controller.js";
import { MakeGetGraphRoute } from "./getGraph.controller.js";
import { MakeListGraphsRoute } from "./listGraphs.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeGraphsRoutes = (router: Router, ctx: ServerContext): void => {
  router.use(
    "/graphs",
    makeCacheMiddleware(ctx.redis, { ttl: 300, keyPrefix: "cache:graphs" }),
  );
  MakeGetFlowGraphRoute(router, ctx);
  MakeGetGraphRoute(router, ctx);
  MakeListGraphsRoute(router, ctx);
  MakeCreateGraphRoute(router, ctx);
  MakeEditGraphRoute(router, ctx);
  MakeEditFlowGraphRoute(router, ctx);
};

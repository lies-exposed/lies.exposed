import { type Router } from "express";
import { MakeCreateGraphRoute } from "./createGraph.controller.js";
import { MakeEditFlowGraphRoute } from "./editFlowGraph.controller.js";
import { MakeEditGraphRoute } from "./editGraph.controller.js";
import { MakeGetFlowGraphRoute } from "./getFlowGraph.controller.js";
import { MakeGetGraphRoute } from "./getGraph.controller.js";
import { MakeListGraphsRoute } from "./listGraphs.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGraphsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetFlowGraphRoute(router, ctx);
  MakeGetGraphRoute(router, ctx);
  MakeListGraphsRoute(router, ctx);
  MakeCreateGraphRoute(router, ctx);
  MakeEditGraphRoute(router, ctx);
  MakeEditFlowGraphRoute(router, ctx);
};

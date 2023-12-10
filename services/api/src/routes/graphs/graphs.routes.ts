import { type Router } from "express";
import { MakeEditFlowGraphRoute } from "./editFlowGraph.controller.js";
import { MakeGetFlowGraphRoute } from "./getFlowGraph.controller.js";
import { MakeGetGraphsRoute } from "./getGraph.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGraphsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetFlowGraphRoute(router, ctx);
  MakeGetGraphsRoute(router, ctx);
  MakeEditFlowGraphRoute(router, ctx);
};

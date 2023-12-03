import { type Router } from "express";
import { MakeEditFlowGraphRoute } from "./editFlowGraph.controller";
import { MakeGetFlowGraphRoute } from "./getFlowGraph.controller";
import { MakeGetGraphsRoute } from "./getGraph.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeGraphsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetFlowGraphRoute(router, ctx);
  MakeGetGraphsRoute(router, ctx);
  MakeEditFlowGraphRoute(router, ctx);
};

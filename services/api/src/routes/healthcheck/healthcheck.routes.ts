import { type Router } from "express";
import { MakeGetHealthcheckRoute } from "./getHealthcheck.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeHealthcheckRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeGetHealthcheckRoute(router, ctx);
};

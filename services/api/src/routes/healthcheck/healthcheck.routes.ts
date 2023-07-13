import { type Router } from "express";
import { MakeGetHealthcheckRoute } from "./getHealthcheck.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeHealthcheckRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeGetHealthcheckRoute(router, ctx);
};

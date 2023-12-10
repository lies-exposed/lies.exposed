import { type Router } from "express";
import { MakeListProjectImageRoute } from "./listProjectImages.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeProjectImageRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeListProjectImageRoute(router, ctx);
};

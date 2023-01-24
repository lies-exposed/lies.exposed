import { type Router } from "express";
import { MakeListProjectImageRoute } from "./listProjectImages.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeProjectImageRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeListProjectImageRoute(router, ctx);
};

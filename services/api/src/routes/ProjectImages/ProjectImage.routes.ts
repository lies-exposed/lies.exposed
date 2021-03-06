import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeListProjectImageRoute } from "./listProjectImages.controller";

export const MakeProjectImageRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeListProjectImageRoute(router, ctx);
};

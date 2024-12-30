import { type Router } from "express";
import { MakeListProjectImageRoute } from "./listProjectImages.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeProjectImageRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeListProjectImageRoute(router, ctx);
};

import { type Router } from "express";
import { MakeGetHealthcheckRoute } from "./getHealthcheck.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeHealthcheckRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeGetHealthcheckRoute(router, ctx);
};

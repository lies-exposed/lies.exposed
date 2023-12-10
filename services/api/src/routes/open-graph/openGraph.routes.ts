import { type Router } from "express";
import { MakeGetMetadataRoute } from "./getMetadata.route.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeOpenGraphRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeGetMetadataRoute(router, ctx);
};

import { type Router } from "express";
import { MakeGetMetadataRoute } from "./getMetadata.route";
import { type RouteContext } from "@routes/route.types";

export const MakeOpenGraphRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeGetMetadataRoute(router, ctx);
};

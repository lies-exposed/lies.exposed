import { type Router } from "express";
import { MakeGetMetadataRoute } from "./getMetadata.route.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeOpenGraphRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeGetMetadataRoute(router, ctx);
};

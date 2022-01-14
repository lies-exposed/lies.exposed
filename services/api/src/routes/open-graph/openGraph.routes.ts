import { Router } from "express";
import { MakeGetMetadataRoute } from "./getMetadata.route";
import { RouteContext } from "@routes/route.types";

export const MakeOpenGraphRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetMetadataRoute(router, ctx);
};

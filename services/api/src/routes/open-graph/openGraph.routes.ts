import { Router } from "express";
import { RouteContext } from "@routes/route.types";
import { MakeGetMetadataRoute } from "./getMetadata.route";

export const MakeOpenGraphRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetMetadataRoute(router, ctx);
};

import { type Router } from "express";
import { MakeAdminSearchAreaCoordinatesRoute } from "./areas/searchCoordinates.controller.js";
import { MakeAdminBuildImageRoute } from "./images/buildImage.controller.js";
import { MakeAdminGetOrphanMediaRoute } from "./media/getOrphanMedia.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeAdminRoutes = (router: Router, ctx: RouteContext): void => {
  MakeAdminBuildImageRoute(router, ctx);
  MakeAdminSearchAreaCoordinatesRoute(router, ctx);
  MakeAdminGetOrphanMediaRoute(router, ctx);
};

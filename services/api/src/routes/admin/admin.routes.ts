import { type Router } from "express";
import { MakeAdminSearchAreaCoordinatesRoute } from "./areas/searchCoordinates.controller.js";
import { MakeAdminBuildImageRoute } from "./images/buildImage.controller.js";
import { MakeAdminGetLinkStatsRoute } from "./links/getLinkStats.controller.js";
import { MakeAdminGetMediaStatsRoute } from "./media/getMediaStats.controller.js";
import { MakeAdminExtractEntitiesWithNLPRoute } from "./nlp/extractEntitiesWithNLP.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeAdminRoutes = (router: Router, ctx: RouteContext): void => {
  MakeAdminBuildImageRoute(router, ctx);
  MakeAdminSearchAreaCoordinatesRoute(router, ctx);
  MakeAdminGetLinkStatsRoute(router, ctx);
  MakeAdminGetMediaStatsRoute(router, ctx);
  MakeAdminExtractEntitiesWithNLPRoute(router, ctx);
};

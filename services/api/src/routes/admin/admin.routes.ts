import { type Router } from "express";
import { MakeAdminSearchAreaCoordinatesRoute } from "./areas/searchCoordinates.controller.js";
import { MakeAdminBuildImageRoute } from "./images/buildImage.controller.js";
import { MakeAdminGetLinkStatsRoute } from "./links/getLinkStats.controller.js";
import { MakeAdminGetMediaStatsRoute } from "./media/getMediaStats.controller.js";
import {
  MakeAdminTriggerExtractEntitiesWithNLPRoute,
  MakeAdminGetExtractEntitiesWithNLPRoute,
} from "./nlp/extractEntitiesWithNLP.controller.js";
import { MakeQueueRoutes } from "./queues/queues.routes.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeAdminRoutes = (router: Router, ctx: ServerContext): void => {
  MakeAdminBuildImageRoute(router, ctx);
  MakeAdminSearchAreaCoordinatesRoute(router, ctx);
  MakeAdminGetLinkStatsRoute(router, ctx);
  MakeAdminGetMediaStatsRoute(router, ctx);
  MakeAdminTriggerExtractEntitiesWithNLPRoute(router, ctx);
  MakeAdminGetExtractEntitiesWithNLPRoute(router, ctx);
  // queues
  MakeQueueRoutes(router, ctx);
};

import { type Router } from "express";
import { MakeCreateMediaRoute } from "./createMedia.route";
import { MakeDeleteMediaRoute } from "./deleteMedia.route";
import { MakeEditMediaRoute } from "./editMedia.controller";
import { MakeGetMediaRoute } from "./getMedia.controller";
import { MakeGetMediaThumbnailsRoute } from "./getMediaThumbnails.controller";
import { MakeListMediaRoute } from "./listMedia.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeMediaRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetMediaRoute(router, ctx);
  MakeListMediaRoute(router, ctx);
  MakeEditMediaRoute(router, ctx);
  MakeCreateMediaRoute(router, ctx);
  MakeDeleteMediaRoute(router, ctx);
  MakeGetMediaThumbnailsRoute(router, ctx);
};

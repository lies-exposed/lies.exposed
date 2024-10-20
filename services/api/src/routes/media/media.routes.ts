import { type Router } from "express";
import { MakeCreateMediaRoute } from "./createMedia.route.js";
import { MakeDeleteMediaRoute } from "./deleteMedia.route.js";
import { MakeEditMediaRoute } from "./editMedia.controller.js";
import { MakeGenerateMediaThumbnailsRoute } from "./generateMediaThumbnails.controller.js";
import { MakeGetMediaRoute } from "./getMedia.controller.js";
import { MakeListMediaRoute } from "./listMedia.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeMediaRoutes = (router: Router, ctx: RouteContext): void => {
  // thumbnails
  MakeGenerateMediaThumbnailsRoute(router, ctx);

  // REST API
  MakeGetMediaRoute(router, ctx);
  MakeListMediaRoute(router, ctx);
  MakeEditMediaRoute(router, ctx);
  MakeCreateMediaRoute(router, ctx);
  MakeDeleteMediaRoute(router, ctx);
};

import { Router } from "express";
import { MakeCreateMediaRoute } from "./createMedia.route";
import { MakeDeleteMediaRoute } from "./deleteMedia.route";
import { MakeEditMediaRoute } from "./editMedia.route";
import { RouteContext } from "@routes/route.types";
import { MakeGetMediaRoute } from "./getMedia.routes";
import { MakeListMediaRoute } from "./listMedia.controller";

export const MakeMediaRoutes = (router: Router, ctx: RouteContext): void => {
  MakeGetMediaRoute(router, ctx);
  MakeListMediaRoute(router, ctx);
  MakeEditMediaRoute(router, ctx);
  MakeCreateMediaRoute(router, ctx);
  MakeDeleteMediaRoute(router, ctx);
};

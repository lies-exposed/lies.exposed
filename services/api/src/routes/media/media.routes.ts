import { Router } from "express";
import { MakeDeleteMediaRoute } from "./deleteMedia.route";
import { MakeEditMediaRoute } from "./editMedia.route";
import { MakeGetMediaRoute } from "./getMedia.routes";
import { MakeListMediaRoute } from "./listMedia.controller";
import { RouteContext } from "@routes/route.types";

export const MakeMediaRoutes = (router: Router, ctx: RouteContext): void => {
  MakeListMediaRoute(router, ctx);
  MakeGetMediaRoute(router, ctx);
  MakeEditMediaRoute(router, ctx);
  MakeDeleteMediaRoute(router, ctx);
};

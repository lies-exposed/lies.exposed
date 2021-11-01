import { Router } from "express";
import { MakeDeleteImageRoute } from "./deleteImage.route";
import { MakeEditImageRoute } from "./editImage.route";
import { MakeGetImageRoute } from "./getImage.routes";
import { MakeListImagesRoute } from "./listImages.controller";
import { RouteContext } from "@routes/route.types";

export const MakeImageRoutes = (router: Router, ctx: RouteContext): void => {
  MakeListImagesRoute(router, ctx);
  MakeGetImageRoute(router, ctx);
  MakeEditImageRoute(router, ctx);
  MakeDeleteImageRoute(router, ctx);
};

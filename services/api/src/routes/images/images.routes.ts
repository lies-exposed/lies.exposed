import { Router } from "express";
import { MakeListImagesRoute } from "./listImages.controller";
import { RouteContext } from "@routes/route.types";

export const MakeImageRoutes = (router: Router, ctx: RouteContext): void => {
  MakeListImagesRoute(router, ctx);
};

import { type Router } from "express";
import { MakeAdminBuildImageRoute } from "./images/buildImage.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeAdminRoutes = (router: Router, ctx: RouteContext): void => {
  MakeAdminBuildImageRoute(router, ctx);
};

import { type Router } from "express";
import { MakeAdminBuildImageRoute } from "./images/buildImage.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeAdminRoutes = (router: Router, ctx: RouteContext): void => {
  MakeAdminBuildImageRoute(router, ctx);
};

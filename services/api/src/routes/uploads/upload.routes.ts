import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeSignedUrlRoute } from "./getSignedURL.controller";

export const MakeUploadsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSignedUrlRoute(router, ctx);
};

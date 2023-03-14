import { type Router } from "express";
import { PostSharePayloadToPlatformRoute } from "./postEventToPlatform.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeAdminRoutes = (router: Router, ctx: RouteContext): void => {
  PostSharePayloadToPlatformRoute(router, ctx);
};

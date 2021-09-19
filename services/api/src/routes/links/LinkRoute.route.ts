import { Router } from "express";
import { MakeCreateLinkRoute } from "./createLink.controller";
import { MakeListLinksRoute } from "./listLinks.controller";
import { RouteContext } from "@routes/route.types";

export const MakeLinkRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateLinkRoute(router, ctx);
  MakeListLinksRoute(router, ctx);
};

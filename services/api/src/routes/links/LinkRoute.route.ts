import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeCreateLinkRoute } from "./createLink.controller";
import { MakeListLinksRoute } from "./listLinks.controller";

export const MakeLinkRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateLinkRoute(router, ctx);
  MakeListLinksRoute(router, ctx);
};

import { Router } from "express";
import { MakeCreateLinkRoute } from "./createLink.controller";
import { MakeEditLinkRoute } from "./editLink.controller";
import { MakeEditLinkMetadataRoute } from "./editLinkMetadata.controller";
import { MakeGetLinksRoute } from "./getLink.controller";
import { MakeListLinksRoute } from "./listLinks.controller";
import { RouteContext } from "@routes/route.types";

export const MakeLinkRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateLinkRoute(router, ctx);
  MakeEditLinkMetadataRoute(router, ctx);
  MakeEditLinkRoute(router, ctx);
  MakeGetLinksRoute(router, ctx);
  MakeListLinksRoute(router, ctx);
};

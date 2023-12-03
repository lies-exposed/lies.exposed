import { type Router } from "express";
import { MakeCreateLinkRoute } from "./createLink.controller";
import { MakeCreateManyLinkRoute } from "./createManyLink.controller";
import { MakeDeleteLinkRoute } from "./deleteLink.controller";
import { MakeEditLinkRoute } from "./editLink.controller";
import { MakeEditLinkMetadataRoute } from "./editLinkMetadata.controller";
import { MakeGetLinksRoute } from "./getLink.controller";
import { MakeListLinksRoute } from "./listLinks.controller";
import { MakeSubmitLinkRoute } from "./submitLink.controller";
import { MakeTakeLinkScreenshotRoute } from "./takeLinkScreenshot.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeLinkRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSubmitLinkRoute(router, ctx);
  MakeCreateManyLinkRoute(router, ctx);
  MakeCreateLinkRoute(router, ctx);
  MakeEditLinkMetadataRoute(router, ctx);
  MakeEditLinkRoute(router, ctx);
  MakeDeleteLinkRoute(router, ctx);
  MakeGetLinksRoute(router, ctx);
  MakeListLinksRoute(router, ctx);
  MakeTakeLinkScreenshotRoute(router, ctx);
};

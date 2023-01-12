import { Router } from "express";
import { MakeCreateLinkRoute } from "./createLink.controller";
import { MakeCreateManyLinkRoute } from './createManyLink.controller';
import { MakeDeleteLinkRoute } from "./deleteLink.controller";
import { RouteContext } from "@routes/route.types";
import { MakeEditLinkRoute } from "./editLink.controller";
import { MakeEditLinkMetadataRoute } from "./editLinkMetadata.controller";
import { MakeGetLinksRoute } from "./getLink.controller";
import { MakeListLinksRoute } from "./listLinks.controller";

export const MakeLinkRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateManyLinkRoute(router, ctx);
  MakeCreateLinkRoute(router, ctx);
  MakeEditLinkMetadataRoute(router, ctx);
  MakeEditLinkRoute(router, ctx);
  MakeDeleteLinkRoute(router, ctx);
  MakeGetLinksRoute(router, ctx);
  MakeListLinksRoute(router, ctx);
};

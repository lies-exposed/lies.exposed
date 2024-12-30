import { type Router } from "express";
import { MakeCreateLinkRoute } from "./createLink.controller.js";
import { MakeCreateManyLinkRoute } from "./createManyLink.controller.js";
import { MakeDeleteLinkRoute } from "./deleteLink.controller.js";
import { MakeEditLinkRoute } from "./editLink.controller.js";
import { MakeEditLinkMetadataRoute } from "./editLinkMetadata.controller.js";
import { MakeGetLinksRoute } from "./getLink.controller.js";
import { MakeListLinksRoute } from "./listLinks.controller.js";
import { MakeSubmitLinkRoute } from "./submitLink.controller.js";
import { MakeTakeLinkScreenshotRoute } from "./takeLinkScreenshot.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeLinkRoutes = (router: Router, ctx: ServerContext): void => {
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

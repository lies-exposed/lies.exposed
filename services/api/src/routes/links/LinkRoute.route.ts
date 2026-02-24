import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
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
  router.use(
    "/links",
    makeCacheMiddleware(ctx.redis, { ttl: 1800, keyPrefix: "cache:links" }),
  );
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

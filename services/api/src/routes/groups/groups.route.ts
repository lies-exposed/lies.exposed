import { makeCacheMiddleware } from "@liexp/backend/lib/express/middleware/cache.middleware.js";
import { type Router } from "express";
import { MakeCreateGroupRoute } from "./createGroup.controller.js";
import { MakeDeleteGroupRoute } from "./deleteGroup.controller.js";
import { MakeEditGroupRoute } from "./editGroup.controller.js";
import { MakeGetGroupRoute } from "./getGroup.controller.js";
import { MakeListGroupRoute } from "./getGroups.controller.js";
import { MakeLinkGroupEventsRoute } from "./linkGroupEvents.controller.js";
import { MakeUnlinkGroupEventRoute } from "./unlinkGroupEvents.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeGroupRoutes = (router: Router, ctx: ServerContext): void => {
  router.use(
    "/groups",
    makeCacheMiddleware(ctx.redis, { ttl: 3600, keyPrefix: "cache:groups" }),
  );
  MakeCreateGroupRoute(router, ctx);
  MakeEditGroupRoute(router, ctx);
  MakeGetGroupRoute(router, ctx);
  MakeListGroupRoute(router, ctx);
  MakeDeleteGroupRoute(router, ctx);
  MakeLinkGroupEventsRoute(router, ctx);
  MakeUnlinkGroupEventRoute(router, ctx);
};

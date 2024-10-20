import { type Router } from "express";
import { MakeQueueCreateRoute } from "./queueCreate.controller.js";
import { MakeQueueDeleteRoute } from "./queueDelete.controller.js";
import { MakeQueueEditRoute } from "./queueEdit.controller.js";
import { MakeQueueGetRoute } from "./queueGet.controller.js";
import { MakeQueueListRoute } from "./queueList.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeQueueRoutes = (router: Router, ctx: RouteContext): void => {
  MakeQueueListRoute(router, ctx);
  MakeQueueGetRoute(router, ctx);
  MakeQueueCreateRoute(router, ctx);
  MakeQueueEditRoute(router, ctx);
  MakeQueueDeleteRoute(router, ctx);
};

import { type Router } from "express";
import { MakeQueueCreateRoute } from "./queueCreate.controller.js";
import { MakeQueueDeleteRoute } from "./queueDelete.controller.js";
import { MakeQueueEditRoute } from "./queueEdit.controller.js";
import { MakeQueueGetRoute } from "./queueGet.controller.js";
import { MakeQueueListRoute } from "./queueList.controller.js";
import { MakeQueueProcessRoute } from "./queueProcess.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeQueueRoutes = (router: Router, ctx: ServerContext): void => {
  MakeQueueListRoute(router, ctx);
  MakeQueueGetRoute(router, ctx);
  MakeQueueCreateRoute(router, ctx);
  MakeQueueEditRoute(router, ctx);
  MakeQueueDeleteRoute(router, ctx);
  MakeQueueProcessRoute(router, ctx);
};

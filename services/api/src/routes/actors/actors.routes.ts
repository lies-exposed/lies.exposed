import { type Router } from "express";
import { MakeCreateActorRoute } from "./createActor.controller.js";
import { MakeDeleteActorRoute } from "./deleteActor.controller.js";
import { MakeEditActorRoute } from "./editActor.controller.js";
import { MakeGetActorRoute } from "./getActor.controller.js";
import { MakeLinkActorEventsRoute } from "./linkActorEvents.controller.js";
import { MakeListPageRoute } from "./listActor.controller.js";
import { MakeMergeActorRoute } from "./mergeActor.controller.js";
import { MakeUnlinkActorEventRoute } from "./unlinkActorEvents.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeActorRoutes = (router: Router, ctx: ServerContext): void => {
  MakeCreateActorRoute(router, ctx);
  MakeEditActorRoute(router, ctx);
  MakeGetActorRoute(router, ctx);
  MakeListPageRoute(router, ctx);
  MakeDeleteActorRoute(router, ctx);
  MakeMergeActorRoute(router, ctx);
  MakeLinkActorEventsRoute(router, ctx);
  MakeUnlinkActorEventRoute(router, ctx);
};

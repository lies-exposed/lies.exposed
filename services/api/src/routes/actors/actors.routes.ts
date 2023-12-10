import { type Router } from "express";
import { MakeCreateActorRoute } from "./createActor.controller.js";
import { MakeDeleteActorRoute } from "./deleteActor.controller.js";
import { MakeEditActorRoute } from "./editActor.controller.js";
import { MakeGetActorRoute } from "./getActor.controller.js";
import { MakeListPageRoute } from "./listActor.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeActorRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateActorRoute(router, ctx);
  MakeEditActorRoute(router, ctx);
  MakeGetActorRoute(router, ctx);
  MakeListPageRoute(router, ctx);
  MakeDeleteActorRoute(router, ctx);
};

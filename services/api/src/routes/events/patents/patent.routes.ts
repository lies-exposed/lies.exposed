import { type Router } from "express";
import { MakeCreatePatentEventRoute } from "./createPatent.controller.js";
import { MakeEditPatentEventRoute } from "./editPatent.controller.js";
import { MakeGetListPatentEventRoute } from "./getListPatent.controller.js";
import { MakeGetPatentEventRoute } from "./getPatent.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakePatentEventsRoutes = (
  router: Router,
  ctx: RouteContext,
): void => {
  MakeGetPatentEventRoute(router, ctx);
  MakeGetListPatentEventRoute(router, ctx);
  MakeCreatePatentEventRoute(router, ctx);
  MakeEditPatentEventRoute(router, ctx);
};

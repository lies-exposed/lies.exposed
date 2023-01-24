import { type Router } from "express";
import { MakeCreatePatentEventRoute } from "./createPatent.controller";
import { MakeEditPatentEventRoute } from "./editPatent.controller";
import { MakeGetListPatentEventRoute } from "./getListPatent.controller";
import { MakeGetPatentEventRoute } from "./getPatent.controller";
import { type RouteContext } from "@routes/route.types";

export const MakePatentEventsRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeGetPatentEventRoute(router, ctx);
  MakeGetListPatentEventRoute(router, ctx);
  MakeCreatePatentEventRoute(router, ctx);
  MakeEditPatentEventRoute(router, ctx);
};

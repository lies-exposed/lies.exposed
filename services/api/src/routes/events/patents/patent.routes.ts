import { Router } from "express";
import { MakeCreatePatentEventRoute } from "./createPatent.controller";
import { MakeEditPatentEventRoute } from "./editPatent.controller";
import { MakeGetListPatentEventRoute } from "./getListPatent.controller";
import { RouteContext } from "@routes/route.types";
import { MakeGetPatentEventRoute } from "./getPatent.controller";

export const MakePatentEventsRoutes = (
  router: Router,
  ctx: RouteContext
): void => {
  MakeGetPatentEventRoute(router, ctx);
  MakeGetListPatentEventRoute(router, ctx);
  MakeCreatePatentEventRoute(router, ctx);
  MakeEditPatentEventRoute(router, ctx);
};

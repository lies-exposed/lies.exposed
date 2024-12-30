import { type Router } from "express";
import { MakeCreatePatentEventRoute } from "./createPatent.controller.js";
import { MakeEditPatentEventRoute } from "./editPatent.controller.js";
import { MakeGetListPatentEventRoute } from "./getListPatent.controller.js";
import { MakeGetPatentEventRoute } from "./getPatent.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakePatentEventsRoutes = (
  router: Router,
  ctx: ServerContext,
): void => {
  MakeGetPatentEventRoute(router, ctx);
  MakeGetListPatentEventRoute(router, ctx);
  MakeCreatePatentEventRoute(router, ctx);
  MakeEditPatentEventRoute(router, ctx);
};

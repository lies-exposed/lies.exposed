import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeCreateEventRoute } from "./createEvent.controller";
import { MakeEditEventRoute } from "./editEvent.controller";
import { MakeGetEventRoute } from "./getEvent.controller";
import { MakeListEventRoute } from "./getEvents.controller";

export const MakeEventRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateEventRoute(router, ctx);
  MakeEditEventRoute(router, ctx);
  MakeGetEventRoute(router, ctx);
  MakeListEventRoute(router, ctx);
};

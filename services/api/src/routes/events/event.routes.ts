import { Router } from "express";
import { MakeCreateEventRoute } from "./createEvent.controller";
import { MakeDeleteEventRoute } from "./deleteEvent.controller";
import { MakeEditEventRoute } from "./editEvent.controller";
import { MakeGetEventRoute } from "./getEvent.controller";
import { MakeListEventRoute } from "./getEvents.controller";
import { MakeSearchEventRoute } from "./searchEvents.controller";
import { RouteContext } from "@routes/route.types";

export const MakeEventRoutes = (router: Router, ctx: RouteContext): void => {
  MakeCreateEventRoute(router, ctx);
  MakeEditEventRoute(router, ctx);
  MakeSearchEventRoute(router, ctx);
  MakeListEventRoute(router, ctx);
  MakeGetEventRoute(router, ctx);
  MakeDeleteEventRoute(router, ctx);
};

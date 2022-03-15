import { Router } from "express";
import { MakeCreateEventRoute } from "./createEvent.controller";
import { MakeDeleteEventRoute } from "./deleteEvent.controller";
import { MakeEditEventRoute } from "./editEvent.controller";
import { MakeGetEventRoute } from "./getEvent.controller";
import { MakeSearchEventRoute } from "./searchEvents.controller";
import { RouteContext } from "@routes/route.types";
// import { MakeCreateEventFromLinkRoute } from './createEventFromLink.controller';
import { MakeGetEventFromLinkRoute } from './getEventFromLink.controller';

export const MakeEventRoutes = (router: Router, ctx: RouteContext): void => {
  // MakeCreateEventFromLinkRoute(router, ctx);
  MakeCreateEventRoute(router, ctx);
  MakeEditEventRoute(router, ctx);
  MakeSearchEventRoute(router, ctx);
  MakeGetEventRoute(router, ctx);
  MakeGetEventFromLinkRoute(router, ctx);
  MakeDeleteEventRoute(router, ctx);
};

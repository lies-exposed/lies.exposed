import { Router } from "express";
import { MakeCreateEventRoute } from "./createEvent.controller";
import { MakeCreateEventFromSuggestionRoute } from './createEventFromSuggestion.controller';
import { MakeCreateEventSuggestionRoute } from './createEventSuggestion.controller';
import { MakeDeleteEventRoute } from "./deleteEvent.controller";
import { MakeEditEventRoute } from "./editEvent.controller";
import { MakeGetEventRoute } from "./getEvent.controller";
import { MakeGetEventFromLinkRoute } from './getEventFromLink.controller';
import { MakeSearchEventRoute } from "./searchEvents.controller";
import { MakeGetEventSuggestionRoute } from './suggestions/getEventSuggestion.controller';
import { MakeGetEventSuggestionListRoute } from './suggestions/getEventSuggestionList.controller';
import { RouteContext } from "@routes/route.types";


export const MakeEventRoutes = (router: Router, ctx: RouteContext): void => {
  // MakeCreateEventFromLinkRoute(router, ctx);
  MakeCreateEventFromSuggestionRoute(router, ctx);
  MakeCreateEventSuggestionRoute(router, ctx);
  MakeCreateEventRoute(router, ctx);
  MakeEditEventRoute(router, ctx);
  MakeSearchEventRoute(router, ctx);
  MakeGetEventSuggestionRoute(router, ctx);
  MakeGetEventSuggestionListRoute(router, ctx);
  MakeGetEventRoute(router, ctx);
  MakeGetEventFromLinkRoute(router, ctx);
  MakeDeleteEventRoute(router, ctx);
};

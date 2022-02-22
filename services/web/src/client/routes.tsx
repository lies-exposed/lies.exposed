import * as React from "react";
import IndexPage from "./pages";
import EventsPage from "./pages/EventsPage";
import ActorTemplate from "./templates/ActorTemplate";
import EventTemplate from "./templates/EventTemplate";

export const routes = [
  {
    path: "/actors/:actorId",
    route: ({
      match: {
        params: { actorId },
      },
    }: any) => <ActorTemplate actorId={actorId} />,
  },
  {
    path: "/events/:eventId",
    route: ({
      match: {
        params: { eventId },
      },
    }: any) => <EventTemplate eventId={eventId} />,
  },
  {
    path: "/events",
    route: () => <EventsPage />,
  },
  {
    path: "/",
    route: () => <IndexPage />,
  },
];

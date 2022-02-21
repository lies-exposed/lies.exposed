import * as React from "react";
import IndexPage from "./pages";
import EventsPage from "./pages/EventsPage";

export const routes = [
  {
    path: "/",
    route: () => <IndexPage />,
  },
  {
    path: "/events",
    route: () => <EventsPage />,
  },
];

import * as React from "react";
import IndexPage from "./pages";
import ActorsPage from "./pages/ActorsPage";
import EventsPage from "./pages/EventsPage";
import GroupsPage from "./pages/GroupsPage";
import KeywordsPage from "./pages/KeywordsPage";
import ActorTemplate from "./templates/ActorTemplate";
import EventTemplate from "./templates/EventTemplate";
import GroupTemplate from "./templates/GroupTemplate";
import KeywordTemplate from "./templates/KeywordTemplate";

export const routes = [
  {
    path: "/groups/:groupId",
    route: ({
      match: {
        params: { groupId },
      },
    }: any) => <GroupTemplate groupId={groupId} />,
  },
  {
    path: "/groups",
    route: (props: any) => <GroupsPage />,
  },
  {
    path: "/actors/:actorId",
    route: ({
      match: {
        params: { actorId },
      },
    }: any) => <ActorTemplate actorId={actorId} />,
  },
  {
    path: "/actors",
    route: (props: any) => <ActorsPage />,
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
    path: "/keywords/:keywordId",
    route: ({
      match: {
        params: { keywordId },
      },
    }: any) => <KeywordTemplate keywordId={keywordId} />,
  },
  {
    path: "/keywords",
    route: () => <KeywordsPage />,
  },
  {
    path: "/",
    route: () => <IndexPage />,
  },
];

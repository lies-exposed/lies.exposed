import {
  fetchActor,
  fetchEvent,
  fetchGroup,
  fetchGroups,
  fetchGroupsMembers,
  fetchMedia,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { fetchGithubRepo } from "@liexp/ui/state/queries/github";
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

const githubQuery = {
  queryKey: ["github", { user: "lies-exposed", repo: "lies.exposed" }],
  queryFn: fetchGithubRepo,
} as any;

const commonQueries = [githubQuery];

export const routes = [
  {
    path: "/groups/:groupId",
    route: <GroupTemplate />,
    queries: ({ groupId }: any) => [
      ...commonQueries,
      {
        queryKey: ["groups", { id: groupId }],
        queryFn: fetchGroup,
      },
      {
        queryKey: [
          "groups-members",
          {
            pagination: {
              page: 1,
              perPage: 20,
            },
            sort: { field: "id", order: "DESC" },
            filter: {
              group: groupId,
            },
          },
        ],
        queryFn: fetchGroupsMembers,
      },
    ],
  },
  {
    path: "/groups",
    route: <GroupsPage />,
    queries: () => [...commonQueries],
  },
  {
    path: "/actors/:actorId",
    route: <ActorTemplate />,
    queries: ({ actorId }: { actorId: string }) => [
      ...commonQueries,
      {
        queryKey: ["actors", { id: actorId }],
        queryFn: fetchActor,
      },
      {
        queryKey: [
          "groups",
          {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { members: [actorId] },
          },
        ],
        queryFn: fetchGroups,
      },
    ],
  },
  {
    path: "/actors",
    route: <ActorsPage />,
    queries: () => [...commonQueries],
  },
  {
    path: "/events/:eventId",
    route: <EventTemplate />,
    queries: ({ eventId }: any) => [
      ...commonQueries,
      {
        queryKey: ["event", { id: eventId }],
        queryFn: fetchEvent,
      },
      {
        queryKey: [
          "media",
          {
            sort: {
              field: "createdAt",
              order: "DESC",
            },
            pagination: {
              perPage: 1,
              page: 1,
            },
            filter: { events: [eventId] },
          },
        ],
        queryFn: fetchMedia,
      },
    ],
  },
  {
    path: "/events",
    route: <EventsPage />,
    queries: () => [...commonQueries],
  },
  {
    path: "/keywords/:keywordId",
    route: <KeywordTemplate />,
    queries: () => [...commonQueries],
  },
  {
    path: "/keywords",
    route: <KeywordsPage />,
    queries: () => [...commonQueries],
  },
  {
    path: "/",
    route: <IndexPage />,
    queries: () => [...commonQueries],
  },
];

import {
  fetchActor,
  fetchEvent,
  fetchGroup,
  fetchGroups,
  fetchGroupsMembers,
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
    route: ({
      match: {
        params: { groupId },
      },
    }: any) => <GroupTemplate groupId={groupId} />,
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
    route: (props: any) => <GroupsPage />,
    queries: () => [
      ...commonQueries,
    ],
  },
  {
    path: "/actors/:actorId",
    route: ({
      match: {
        params: { actorId },
      },
    }: any) => <ActorTemplate actorId={actorId} />,
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
    route: (props: any) => <ActorsPage />,
    queries: () => [
      ...commonQueries,
    ],
  },
  {
    path: "/events/:eventId",
    route: ({
      match: {
        params: { eventId },
      },
    }: any) => <EventTemplate eventId={eventId} />,
    queries: ({ eventId }: any) => [
      ...commonQueries,
      {
        queryKey: ["event", { id: eventId }],
        queryFn: fetchEvent,
      },
    ],
  },
  {
    path: "/events",
    route: () => <EventsPage />,
    queries: () => [...commonQueries],
  },
  {
    path: "/keywords/:keywordId",
    route: ({
      match: {
        params: { keywordId },
      },
    }: any) => <KeywordTemplate keywordId={keywordId} />,
    queries: () => [...commonQueries],
  },
  {
    path: "/keywords",
    route: () => <KeywordsPage />,
    queries: () => [...commonQueries],
  },
  {
    path: "/",
    route: () => <IndexPage />,
    queries: () => [...commonQueries],
  },
];

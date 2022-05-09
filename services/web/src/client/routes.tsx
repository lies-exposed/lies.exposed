import {
  fetchActor,
  fetchEvent,
  fetchGroup,
  fetchGroups,
  fetchGroupsMembers,
  fetchLinks,
  fetchMedia,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { fetchGithubRepo } from "@liexp/ui/state/queries/github";
import * as React from "react";
import { useParams } from "react-router-dom";
import IndexPage from "./pages";
import NotFoundPage from "./pages/404";
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
    route: () => {
      const params = useParams<{ groupId: string }>();
      if (params.groupId) {
        return <GroupTemplate groupId={params.groupId} />;
      }
      return <NotFoundPage />;
    },
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
    queries: () => [...commonQueries],
  },
  {
    path: "/actors/:actorId",
    route: () => {
      const params = useParams<{ actorId: string }>();
      if (params.actorId) {
        return <ActorTemplate actorId={params.actorId} />;
      }
      return <NotFoundPage />;
    },
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
    queries: () => [...commonQueries],
  },
  {
    path: "/events/:eventId",
    route: () => {
      const params = useParams<{ eventId: string }>();
      if (params.eventId) {
        return <EventTemplate eventId={params.eventId} />;
      }

      return <NotFoundPage />;
    },
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
      {
        queryKey: [
          "links",
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
        queryFn: fetchLinks,
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

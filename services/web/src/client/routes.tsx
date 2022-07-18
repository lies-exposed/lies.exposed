import { getRelationIds } from "@liexp/shared/helpers/event";
import { EventType } from "@liexp/shared/io/http/Events";
import {
  fetchActor,
  fetchActors,
  fetchArea,
  fetchAreas,
  fetchEvent,
  fetchEvents,
  fetchGroup,
  fetchGroups,
  fetchGroupsMembers,
  fetchKeywords,
  fetchKeywordsDistribution,
  fetchLinks,
  fetchMedia,
  fetchPageContentByPath,
  getActorQueryKey,
  getActorsQueryKey,
  getAreaQueryKey,
  getEventsQueryKey,
  getGroupsMembersQueryKey,
  getGroupsQueryKey,
  getKeywordsDistributionQueryKey,
  getKeywordsQueryKey,
  getLinkQueryKey,
  getMediaQueryKey,
  getPageContentByPathQueryKey,
} from "@liexp/ui/state/queries/DiscreteQueries";
import {
  fetchSearchEvents,
  fetchSearchEventsInfinite,
  getSearchEventsInfiniteQueryKey,
  getSearchEventsQueryKey,
} from "@liexp/ui/state/queries/SearchEventsQuery";
import { fetchGithubRepo } from "@liexp/ui/state/queries/github";
import { UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { useParams } from "react-router-dom";
import IndexPage from "./pages";
import NotFoundPage from "./pages/404";
import ActorsPage, { queryParams } from "./pages/ActorsPage";
import AreasPage from "./pages/AreasPage";
import EventsPage from "./pages/EventsPage";
import GroupsPage from "./pages/GroupsPage";
import KeywordsPage from "./pages/KeywordsPage";
import ActorTemplate from "./templates/ActorTemplate";
import AreaTemplate from "./templates/AreaTemplate";
import EventTemplate from "./templates/EventTemplate";
import GroupTemplate from "./templates/GroupTemplate";
import KeywordTemplate from "./templates/KeywordTemplate";
import { hashToQuery } from "./utils/history.utils";

const githubQuery = {
  queryKey: ["github", { user: "lies-exposed", repo: "lies.exposed" }],
  queryFn: fetchGithubRepo,
} as any;

const commonQueries = [githubQuery];

export const routes = [
  // group page
  {
    path: "/groups/:groupId",
    route: () => {
      const params = useParams<{ groupId: string }>();
      if (params.groupId) {
        return <GroupTemplate groupId={params.groupId} />;
      }
      return <NotFoundPage />;
    },
    queries: async ({ groupId }: any) => [
      ...commonQueries,
      {
        queryKey: ["groups", { id: groupId }],
        queryFn: fetchGroup,
      },
      {
        queryKey: getGroupsMembersQueryKey(
          {
            filter: {
              group: groupId,
            },
          },
          false
        ),
        queryFn: fetchGroupsMembers,
      },
      {
        queryKey: getEventsQueryKey({
          filter: {
            groups: [groupId],
          },
        }, false),
        queryFn: fetchEvents,
      },
    ],
  },
  // groups
  {
    path: "/groups",
    route: (props: any) => <GroupsPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey("groups"),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getGroupsQueryKey(
          {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          false
        ),
        queryFn: fetchGroups,
      },
    ],
  },
  // actors page
  {
    path: "/actors/:actorId",
    route: () => {
      const params = useParams<{ actorId: string }>();
      if (params.actorId) {
        return <ActorTemplate actorId={params.actorId} />;
      }
      return <NotFoundPage />;
    },
    queries: async ({ actorId }: { actorId: string }) => [
      ...commonQueries,
      {
        queryKey: getActorQueryKey({ id: actorId }),
        queryFn: fetchActor,
      },
      {
        queryKey: getGroupsQueryKey(
          {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { members: [actorId] },
          },
          false
        ),
        queryFn: fetchGroups,
      },
    ],
  },
  // actors
  {
    path: "/actors",
    route: (props: any) => <ActorsPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey("actors"),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getActorsQueryKey(queryParams, false),
        queryFn: fetchActors,
      },
    ],
  },
  // event page
  {
    path: "/events/:eventId",
    route: () => {
      const params = useParams<{ eventId: string }>();
      if (params.eventId) {
        return <EventTemplate eventId={params.eventId} />;
      }

      return <NotFoundPage />;
    },
    queries: async ({ eventId }: any) => {
      const eventQueryKey = ["event", { id: eventId }];
      const event = await fetchEvent({ queryKey: eventQueryKey });

      const { actors, groups, keywords, media } = getRelationIds(event);

      return [
        ...commonQueries,
        {
          queryKey: ["event", { id: eventId }],
          queryFn: () => Promise.resolve(event),
        },
        {
          queryKey: getActorsQueryKey(
            {
              filter: {
                ids: actors,
              },
              pagination: {
                perPage: actors.length,
                page: 1,
              },
            },
            true
          ),
          queryFn: fetchActors,
        },

        {
          queryKey: getMediaQueryKey(
            {
              pagination: {
                perPage: media.length,
                page: 1,
              },
              filter: { ids: media },
            },
            true
          ),
          queryFn: fetchMedia,
        },
        {
          queryKey: getLinkQueryKey(
            {
              pagination: {
                perPage: event.links.length,
                page: 1,
              },
              filter: event.links.length > 0 ? { ids: event.links } : {},
            },
            true
          ),
          queryFn: fetchLinks,
        },
        {
          queryKey: getAreaQueryKey(
            {
              filter: UUID.is((event.payload as any).location)
                ? { ids: [(event.payload as any).location] }
                : {},
              pagination: {
                perPage: 1,
                page: 1,
              },
            },
            true
          ),
          queryFn: fetchAreas,
        },
        {
          queryKey: getKeywordsQueryKey(
            {
              pagination: { page: 1, perPage: keywords.length },
              filter: {
                ids: keywords,
              },
            },
            true
          ),
          queryFn: fetchKeywords,
        },
        {
          queryKey: getSearchEventsQueryKey({
            keywords,
            exclude: [event.id],
            _start: 0,
            _end: 3,
          }),
          queryFn: fetchSearchEvents,
        },
        {
          queryKey: getSearchEventsQueryKey({
            actors,
            exclude: [event.id],
            _start: 0,
            _end: 3,
          }),
          queryFn: fetchSearchEvents,
        },
        {
          queryKey: getSearchEventsQueryKey({
            groups,
            _start: 0,
            _end: 3,
            exclude: [event.id],
          }),
          queryFn: fetchSearchEvents,
        },
      ];
    },
  },
  // events
  {
    path: "/events",
    route: () => <EventsPage />,
    queries: async (params: any, query: any) => {
      const q = hashToQuery(query.hash);

      q.hash = query.hash;
      q.startDate = query.startDate;
      q.endDate = query.endDate;
      q.media = query.media ?? [];
      q.locations = query.locations ?? [];
      q._sort = q._sort ?? "date";
      q.type = q.type ?? EventType.types.map((t) => t.value);
      q.keywords = q.keywords ?? [];
      q.actors = q.actors ?? [];
      q.groups = q.groups ?? [];
      q.groupsMembers = q.groupsMembers ?? [];

      return [
        ...commonQueries,
        {
          queryKey: getSearchEventsQueryKey({
            ...q,
            hash: undefined,
            _start: 0,
            _end: 0,
          }),
          queryFn: fetchSearchEvents,
        },
        {
          queryKey: getActorsQueryKey(
            {
              pagination: { page: 1, perPage: q.actors.length },
              filter: { ids: q.actors },
            },
            true
          ),
          queryFn: fetchActors,
        },
        {
          queryKey: getGroupsQueryKey(
            {
              pagination: { page: 1, perPage: q.groups.length },
              filter: { ids: q.groups },
            },
            true
          ),
          queryFn: fetchGroups,
        },
        {
          queryKey: getGroupsMembersQueryKey(
            {
              pagination: { page: 1, perPage: q.groupsMembers.length },
              filter: { ids: q.groupsMembers },
            },
            true
          ),
          queryFn: fetchGroupsMembers,
        },
        {
          queryKey: getKeywordsQueryKey({
            pagination: { page: 1, perPage: q.keywords.length },
            sort: { field: "updatedAt", order: "DESC" },
            filter: { ids: q.keywords },
          }, true),
          queryFn: fetchKeywords,
        },
        {
          queryKey: getSearchEventsInfiniteQueryKey(q),
          queryFn: fetchSearchEventsInfinite,
        },
      ];
    },
  },
  {
    path: "/keywords/:keywordId",
    route: () => {
      const params = useParams<{ keywordId: string }>();
      if (params.keywordId) {
        return <KeywordTemplate keywordId={params.keywordId} />;
      }
      return <NotFoundPage />;
    },
    queries: async () => [...commonQueries],
  },
  {
    path: "/keywords",
    route: () => <KeywordsPage />,
    queries: async () => [...commonQueries],
  },
  {
    path: "/areas/:areaId",
    route: () => {
      const params = useParams<{ areaId: string }>();
      if (params.areaId) {
        return <AreaTemplate areaId={params.areaId} />;
      }
      return <NotFoundPage />;
    },
    queries: async ({ areaId }: any) => [
      ...commonQueries,
      {
        queryKey: ["areas", { id: areaId }],
        queryFn: fetchArea,
      },
    ],
  },
  {
    path: "/areas",
    route: () => <AreasPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey("areas"),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getAreaQueryKey({
          filter: null,
        }, true),
        queryFn: fetchAreas,
      },
    ],
  },
  {
    path: "/",
    route: () => <IndexPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey("index"),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getKeywordsDistributionQueryKey({
          _start: 0,
          _end: 50,
        }),
        queryFn: fetchKeywordsDistribution,
      },
    ],
  },
];

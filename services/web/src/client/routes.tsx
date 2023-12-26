import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { StatsType } from "@liexp/shared/lib/io/http/Stats";
import { defaultUseQueryListParams } from "@liexp/shared/lib/providers/EndpointQueriesProvider/params";
import { type ServerRoute } from "@liexp/ui/lib/react/ssr";
import {
  fetchSearchEvents,
  fetchSearchEventsInfinite,
  getSearchEventsInfiniteQueryKey,
  getSearchEventsQueryKey,
} from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import { fetchGithubRepo } from "@liexp/ui/lib/state/queries/github";
import { hashToQuery } from "@liexp/ui/lib/utils/history.utils";
import { UUID } from "io-ts-types";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import IndexPage from "./pages";
import NotFoundPage from "./pages/404";

// lazy route components
const ActorsPage = React.lazy(() => import("./pages/ActorsPage"));
const AreasPage = React.lazy(() => import("./pages/AreasPage"));
const CreateStoryPage = React.lazy(
  () => import("./pages/stories/CreateStoryPage"),
);
const BlogPage = React.lazy(() => import("./pages/stories/StorySearchPage"));
const EventsPage = React.lazy(() => import("./pages/EventsPage"));
const GroupsPage = React.lazy(() => import("./pages/GroupsPage"));
const LinksPage = React.lazy(() => import("./pages/LinksPage"));
const KeywordsPage = React.lazy(() => import("./pages/KeywordsPage"));
const MediaPage = React.lazy(() => import("./pages/MediaPage"));
const ProfilePage = React.lazy(() => import("./pages/profile/ProfilePage"));
const LogoutPage = React.lazy(() => import("./pages/Logout"));
const StoryTemplate = React.lazy(() => import("./templates/StoryTemplate"));
const ActorTemplate = React.lazy(() => import("./templates/ActorTemplate"));
const AreaTemplate = React.lazy(() => import("./templates/AreaTemplate"));
const EventTemplate = React.lazy(() => import("./templates/EventTemplate"));
const GroupTemplate = React.lazy(() => import("./templates/GroupTemplate"));
const KeywordTemplate = React.lazy(() => import("./templates/KeywordTemplate"));
const MediaTemplate = React.lazy(() => import("./templates/MediaTemplate"));
const LinkTemplate = React.lazy(() => import("./templates/LinkTemplate"));
const PageTemplate = React.lazy(() => import("./templates/PageTemplate"));
const EditStoryPage = React.lazy(() => import("./pages/stories/EditStoryPage"));

const RedirectToEventsRoute: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (params.id) {
      navigate(`/events/${params.id}`);
    }
  }, [params?.id]);

  return null;
};

const githubQuery = {
  queryKey: ["github", { user: "lies-exposed", repo: "lies.exposed" }],
  queryFn: fetchGithubRepo,
} as any;

const commonQueries = [githubQuery];

const linkRoute: ServerRoute = {
  path: "/links/:linkId",
  route: () => {
    const params = useParams<{ linkId: string }>();
    if (params.linkId) {
      return <LinkTemplate linkId={params.linkId} />;
    }
    return <NotFoundPage />;
  },
  queries:
    (Q) =>
    async ({ linkId }: any) => [
      ...commonQueries,
      {
        queryKey: Q.Link.get.getKey({ id: linkId }),
        queryFn: Q.Link.get.fetch,
      },
    ],
};

const linksRoute: ServerRoute = {
  path: "/links",
  route: () => <LinksPage />,
  queries: (Q) => async () => [
    ...commonQueries,
    {
      queryKey: Q.Link.list.getKey(defaultUseQueryListParams),
      queryFn: Q.Link.list.fetch,
    },
  ],
};

export const routes: ServerRoute[] = [
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
    queries:
      (Q) =>
      async ({ groupId }: any) => [
        ...commonQueries,
        {
          queryKey: Q.Group.get.getKey({ id: groupId }),
          queryFn: Q.Group.get.fetch,
        },
        {
          queryKey: Q.GroupMember.list.getKey(
            {
              filter: {
                group: groupId,
              },
            },
            // false,
          ),
          queryFn: Q.GroupMember.list.fetch,
        },
        {
          queryKey: Q.Stats.get.getKey({
            id: groupId,
            type: StatsType.types[2].value,
          }),
          queryFn: Q.Stats.get.fetch,
        },
      ],
  },
  // groups
  {
    path: "/groups",
    route: (props: any) => <GroupsPage />,
    queries: (Q) => async () => [
      ...commonQueries,
      {
        queryKey: Q.Page.Custom.GetPageContentByPath.getKey("groups"),
        queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
      },
      {
        queryKey: Q.Group.list.getKey(
          {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          // false,
        ),
        queryFn: Q.Group.list.fetch,
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
    queries:
      (Q) =>
      async ({ actorId }: { actorId: string }) => [
        ...commonQueries,
        {
          queryKey: Q.Actor.get.getKey({ id: actorId }),
          queryFn: Q.Actor.get.fetch,
        },
        {
          queryKey: Q.Group.list.getKey(
            {
              pagination: { perPage: 20, page: 1 },
              sort: { field: "createdAt", order: "DESC" },
              filter: { members: [actorId] },
            },
            // false,
          ),
          queryFn: Q.Group.list.fetch,
        },
        {
          queryKey: Q.Stats.get.getKey({
            id: actorId,
            type: StatsType.types[1].value,
          }),
          queryFn: Q.Stats.get.fetch,
        },
      ],
  },
  // actors
  {
    path: "/actors",
    route: (props: any) => <ActorsPage />,
    queries: (Q) => async () => [
      ...commonQueries,
      {
        queryKey: Q.Page.Custom.GetPageContentByPath.getKey("actors"),
        queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
      },
      {
        queryKey: Q.Actor.list.getKey(
          defaultUseQueryListParams,
          // false,
        ),
        queryFn: Q.Actor.list.fetch,
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
    queries:
      (Q) =>
      async ({ eventId }: any) => {
        const event = await Q.Event.get.fetch({ id: eventId });

        const { actors, groups, keywords, media } = getRelationIds(event);

        return [
          ...commonQueries,
          {
            queryKey: ["event", { id: eventId }],
            queryFn: () => Promise.resolve(event),
          },
          {
            queryKey: Q.Actor.list.getKey(
              {
                filter: {
                  ids: actors,
                },
                pagination: {
                  perPage: actors.length,
                  page: 1,
                },
              },
              // true,
            ),
            queryFn: Q.Actor.list.fetch,
          },
          {
            queryKey: Q.Media.list.getKey(
              {
                pagination: {
                  perPage: media.length,
                  page: 1,
                },
                filter: { ids: media },
              },
              // true,
            ),
            queryFn: Q.Media.list.fetch,
          },
          {
            queryKey: Q.Link.list.getKey(
              {
                pagination: {
                  perPage: event.links.length,
                  page: 1,
                },
                filter: event.links.length > 0 ? { ids: event.links } : {},
              },
              // true,
            ),
            queryFn: Q.Link.list.fetch,
          },
          {
            queryKey: Q.Area.list.getKey(
              {
                filter: UUID.is((event.payload as any).location)
                  ? { ids: [(event.payload as any).location] }
                  : {},
                pagination: {
                  perPage: 1,
                  page: 1,
                },
              },
              // true,
            ),
            queryFn: Q.Area.list.fetch,
          },
          {
            queryKey: Q.Keyword.list.getKey(
              // `event-keywords`,
              {
                pagination: { page: 1, perPage: keywords.length },
                filter: {
                  ids: keywords,
                },
              },
              // true,
            ),
            queryFn: Q.Keyword.list.fetch,
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
    queries: (Q) => async (params: any, query: any) => {
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
          queryKey: Q.Actor.list.getKey(
            {
              pagination: { page: 1, perPage: q.actors.length },
              filter: { ids: q.actors },
            },
            // true,
          ),
          queryFn: Q.Actor.list.fetch,
        },
        {
          queryKey: Q.Group.list.getKey(
            {
              pagination: { page: 1, perPage: q.groups.length },
              filter: { ids: q.groups },
            },
            // true,
          ),
          queryFn: Q.Group.list.fetch,
        },
        {
          queryKey: Q.GroupMember.list.getKey(
            {
              pagination: { page: 1, perPage: q.groupsMembers.length },
              filter: { ids: q.groupsMembers },
            },
            // true,
          ),
          queryFn: Q.GroupMember.list.fetch,
        },
        {
          queryKey: Q.Keyword.list.getKey(
            {
              pagination: { page: 1, perPage: q.keywords.length },
              sort: { field: "updatedAt", order: "DESC" },
              filter: { ids: q.keywords },
            },
            // true,
          ),
          queryFn: Q.Keyword.list.fetch,
        },
        {
          queryKey: getSearchEventsInfiniteQueryKey(q),
          queryFn: fetchSearchEventsInfinite,
        },
      ];
    },
  },
  {
    path: "/scientific-studies/:id",
    route: RedirectToEventsRoute,
    redirect: "/events/:id",
  },
  {
    path: "/deaths/:id",
    route: RedirectToEventsRoute,
    redirect: "/events/:id",
  },
  {
    path: "/quotes/:id",
    route: RedirectToEventsRoute,
    redirect: "/events/:id",
  },
  {
    path: "/patents/:id",
    route: RedirectToEventsRoute,
    redirect: "/events/:id",
  },
  {
    path: "/documentaries/:id",
    route: RedirectToEventsRoute,
    redirect: "/events/:id",
  },
  {
    path: "/transactions/:id",
    route: RedirectToEventsRoute,
    redirect: "/events/:id",
  },
  // keywords
  {
    path: "/keywords/:keywordId",
    route: () => {
      const params = useParams<{ keywordId: string }>();
      if (params.keywordId) {
        return <KeywordTemplate keywordId={params.keywordId} />;
      }
      return <NotFoundPage />;
    },
    queries: (Q) => async (params: any) => {
      return [
        ...commonQueries,
        {
          queryKey: Q.Stats.list.getKey(
            {
              filter: { id: params.keywordId, type: StatsType.types[0].value },
            },
            // true,
          ),
          queryFn: Q.Stats.get.fetch,
        },
      ];
    },
  },
  {
    path: "/keywords",
    route: () => <KeywordsPage />,
    queries: (Q) => async () => [...commonQueries],
  },
  // areas
  {
    path: "/areas/:areaId",
    route: () => {
      const params = useParams<{ areaId: string }>();
      if (params.areaId) {
        return <AreaTemplate areaId={params.areaId} />;
      }
      return <NotFoundPage />;
    },
    queries:
      (Q) =>
      async ({ areaId }: any) => [
        ...commonQueries,
        {
          queryKey: Q.Area.get.getKey({ id: areaId }),
          queryFn: Q.Area.get.fetch,
        },
      ],
  },
  {
    path: "/areas",
    route: () => <AreasPage />,
    queries: (Q) => async () => [
      ...commonQueries,
      {
        queryKey: Q.Page.Custom.GetPageContentByPath.getKey("areas"),
        queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
      },
      {
        queryKey: Q.Area.list.getKey(
          {
            filter: null,
          },
          // true,
        ),
        queryFn: Q.Area.list.fetch,
      },
    ],
  },
  // media
  {
    path: "/media/:mediaId",
    route: () => {
      const params = useParams<{ mediaId: string }>();
      if (params.mediaId) {
        return <MediaTemplate mediaId={params.mediaId} />;
      }
      return <NotFoundPage />;
    },
    queries:
      (Q) =>
      async ({ mediaId }: any) => [
        ...commonQueries,
        {
          queryKey: Q.Media.get.getKey({ id: mediaId }),
          queryFn: Q.Media.get.fetch,
        },
      ],
  },
  {
    path: "/media",
    route: () => <MediaPage />,
    queries: (Q) => async () => [
      ...commonQueries,
      {
        queryKey: Q.Page.Custom.GetPageContentByPath.getKey("media"),
        queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
      },
      {
        queryKey: Q.Media.list.getKey(
          {
            filter: null,
          },
          // false,
        ),
        queryFn: Q.Media.list.fetch,
      },
    ],
  },
  // links
  linkRoute,
  linksRoute,
  // stories
  {
    path: "/stories/create/",
    route: () => {
      return <CreateStoryPage />;
    },
    queries:
      (Q) =>
      async ({ storyPath }: any) => {
        return [...commonQueries];
      },
  },
  {
    path: "/stories/:storyId/edit",
    route: () => {
      const params = useParams<{ storyId: string }>();
      if (params.storyId) {
        return <EditStoryPage storyId={params.storyId} />;
      }
      return <NotFoundPage />;
    },
    queries:
      (Q) =>
      async ({ storyId }: any) => {
        return [...commonQueries];
      },
  },
  {
    path: "/stories/:storyPath",
    route: () => {
      const params = useParams<{ storyPath: string }>();
      if (params.storyPath) {
        return <StoryTemplate storyPath={params.storyPath} />;
      }
      return <NotFoundPage />;
    },
    queries:
      (Q) =>
      async ({ storyPath }: any) => {
        const storyParams = { filter: { path: storyPath } };
        const storyKey = Q.Story.list.getKey(storyParams);
        const story = await Q.Story.list
          .fetch(storyParams)
          .then((r) => r.data[0]);

        const mostRecentStoriesParams = {
          filter: {
            exclude: [story.id],
          },
          pagination: {
            perPage: 3,
            page: 1,
          },
          sort: { field: "updatedAt", order: "DESC" as const },
        };
        const mostRecentStoriesKey = Q.Story.list.getKey(
          mostRecentStoriesParams,
        );

        const storyRelatedKeywordsParams = {
          filter: {
            ids: story.keywords,
          },
          pagination: {
            perPage: story.keywords.length,
            page: 1,
          },
          sort: { field: "updatedAt", order: "DESC" as const },
        };
        const storyRelatedKeywordsKey = Q.Keyword.list.getKey(
          storyRelatedKeywordsParams,
        );

        return [
          ...commonQueries,
          {
            queryKey: storyKey,
            queryFn: async () => story,
          },
          {
            queryKey: mostRecentStoriesKey,
            queryFn: Q.Story.list.fetch,
          },
          {
            queryKey: storyRelatedKeywordsKey,
            queryFn: Q.Keyword.list.fetch,
          },
        ];
      },
  },
  {
    path: "/stories",
    route: () => <BlogPage />,
    queries: (Q) => async () => {
      return [
        ...commonQueries,
        {
          queryKey: Q.Page.Custom.GetPageContentByPath.getKey("stories"),
          queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Story.list.getKey(
            {
              pagination: { page: 1, perPage: 20 },
              sort: { field: "id", order: "DESC" as const },
              filter: { draft: "false", exclude: [] },
            },
            // false,
          ),
          queryFn: Q.Story.list.fetch,
        },
      ];
    },
  },
  // profile
  {
    path: "/profile*",
    route: () => <ProfilePage />,
    queries: (Q) => async () => [],
  },
  {
    path: "/logout",
    route: () => <LogoutPage />,
    queries: (Q) => async () => [],
  },
  {
    path: "/:customPath",
    route: () => {
      const params = useParams<{ customPath: string }>();

      if (params.customPath) {
        return <PageTemplate customPath={params.customPath} />;
      }

      return <NotFoundPage />;
    },
    queries: (Q) => async () => [],
  },
  {
    path: "/",
    route: () => <IndexPage />,
    queries: (Q) => async () => [
      ...commonQueries,
      {
        queryKey: Q.Page.Custom.GetPageContentByPath.getKey("index"),
        queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
      },
      {
        queryKey: Q.Keyword.Custom.Distribution.getKey(undefined, {
          _start: "1",
          _end: "50",
        }),
        queryFn: Q.Keyword.Custom.Distribution.fetch,
      },
      {
        queryKey: getSearchEventsQueryKey({
          hash: `${"Last updated events".trim()}`,
          _sort: "updatedAt",
          _order: "DESC",
          _start: 0,
          _end: 6,
        }),
        queryFn: fetchSearchEvents,
      },
      {
        queryKey: Q.Media.list.getKey(
          {
            pagination: {
              perPage: 20,
              page: 1,
            },
            sort: {
              field: "createdAt",
              order: "DESC",
            },
            filter: {},
          },
          // false,
        ),
        queryFn: Q.Media.list.fetch,
      },
    ],
  },
];

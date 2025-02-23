import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import { defaultUseQueryListParams } from "@liexp/shared/lib/providers/EndpointQueriesProvider/params.js";
import { type Configuration } from "@liexp/ui/lib/context/ConfigurationContext";
import {
  type AsyncDataRouteQuery,
  type ServerRoute,
} from "@liexp/ui/lib/react/types.js";
import {
  getSearchEventsInfiniteQueryKey,
  getSearchEventsQueryKey,
} from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import { fetchGithubRepo } from "@liexp/ui/lib/state/queries/github.js";
import { hashToQuery } from "@liexp/ui/lib/utils/history.utils.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BooksPage } from "./pages/events/BooksPage.js";

// lazy route components
const NotFoundPage = React.lazy(() => import("./pages/404.js"));
const IndexPage = React.lazy(() => import("./pages/index.js"));
const ActorsPage = React.lazy(() => import("./pages/ActorsPage"));
const AreasPage = React.lazy(() => import("./pages/AreasPage"));
const CreateStoryPage = React.lazy(
  () => import("./pages/stories/CreateStoryPage"),
);
const BlogPage = React.lazy(() => import("./pages/stories/StorySearchPage.js"));
const EventsPage = React.lazy(() => import("./pages/events/EventsPage.js"));
const GroupsPage = React.lazy(() => import("./pages/GroupsPage.js"));
const LinksPage = React.lazy(() => import("./pages/LinksPage.js"));
const KeywordsPage = React.lazy(() => import("./pages/KeywordsPage.js"));
const MediaPage = React.lazy(() => import("./pages/MediaPage.js"));
const ProfilePage = React.lazy(() => import("./pages/profile/ProfilePage.js"));
const LogoutPage = React.lazy(() => import("./pages/Logout.js"));
const StoryTemplate = React.lazy(() => import("./templates/StoryTemplate.js"));
const ActorTemplate = React.lazy(() => import("./templates/ActorTemplate.js"));
const AreaTemplate = React.lazy(() => import("./templates/AreaTemplate.js"));
const EventTemplate = React.lazy(() => import("./templates/EventTemplate.js"));
const GroupTemplate = React.lazy(() => import("./templates/GroupTemplate.js"));
const KeywordTemplate = React.lazy(
  () => import("./templates/KeywordTemplate.js"),
);
const MediaTemplate = React.lazy(() => import("./templates/MediaTemplate.js"));
const LinkTemplate = React.lazy(() => import("./templates/LinkTemplate.js"));
// const PageTemplate = React.lazy(() => import("./templates/PageTemplate.js"));
const EditStoryPage = React.lazy(
  () => import("./pages/stories/EditStoryPage.js"),
);

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

const githubQuery = (
  _: EndpointsQueryProvider,
  conf: Configuration,
): AsyncDataRouteQuery => ({
  queryKey: [
    "github",
    { user: "lies-exposed", repo: "lies.exposed" },
    true,
    true,
  ],
  queryFn: fetchGithubRepo(conf),
});

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
    (Q, conf) =>
    async ({ linkId }: any) =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Link.get.getKey({ id: linkId }),
          queryFn: Q.Queries.Link.get.fetch,
        },
      ]),
};

const linksRoute: ServerRoute = {
  path: "/links",
  route: () => <LinksPage />,
  queries: (Q, conf) => async () =>
    Promise.resolve([
      ...commonQueries.flatMap((c) => c(Q, conf)),
      {
        queryKey: Q.Queries.Link.list.getKey(defaultUseQueryListParams),
        queryFn: Q.Queries.Link.list.fetch,
      },
    ]),
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
      (Q, conf) =>
      async ({ groupId }: any) =>
        Promise.resolve([
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: Q.Queries.Group.get.getKey({ id: groupId }),
            queryFn: Q.Queries.Group.get.fetch,
          },
          {
            queryKey: Q.Queries.GroupMember.list.getKey(
              {
                filter: {
                  group: groupId,
                },
              },
              // false,
            ),
            queryFn: Q.Queries.GroupMember.list.fetch,
          },
          {
            queryKey: Q.Queries.Stats.list.getKey({
              filter: {
                id: groupId,
                type: StatsType.types[2].value,
              },
            }),
            queryFn: Q.Queries.Stats.list.fetch,
          },
        ]),
  },
  // groups
  {
    path: "/groups",
    route: () => <GroupsPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Page.Custom.GetPageContentByPath.getKey("groups"),
          queryFn: Q.Queries.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Queries.Group.list.getKey(
            {
              pagination: { page: 1, perPage: 20 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            },
            // false,
          ),
          queryFn: Q.Queries.Group.list.fetch,
        },
      ]),
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
      (Q, conf) =>
      async ({ actorId }: { actorId: string }) =>
        Promise.resolve([
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: Q.Queries.Actor.get.getKey({ id: actorId }),
            queryFn: Q.Queries.Actor.get.fetch,
          },
          {
            queryKey: Q.Queries.Group.list.getKey(
              {
                pagination: { perPage: 20, page: 1 },
                sort: { field: "createdAt", order: "DESC" },
                filter: { members: [actorId] },
              },
              // false,
            ),
            queryFn: Q.Queries.Group.list.fetch,
          },
          {
            queryKey: Q.Queries.Stats.list.getKey({
              filter: {
                id: actorId,
                type: StatsType.types[1].value,
              },
            }),
            queryFn: Q.Queries.Stats.list.fetch,
          },
        ]),
  },
  // actors
  {
    path: "/actors",
    route: () => <ActorsPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Page.Custom.GetPageContentByPath.getKey("actors"),
          queryFn: Q.Queries.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Queries.Actor.list.getKey(
            defaultUseQueryListParams,
            // false,
          ),
          queryFn: Q.Queries.Actor.list.fetch,
        },
      ]),
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
      (Q, conf) =>
      async ({ eventId }: any) => {
        const event = await Q.Queries.Event.get.fetch({ id: eventId });

        const { actors, groups, keywords, media } = getRelationIds(event);

        return [
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: ["event", { id: eventId }, true, true],
            queryFn: () => Promise.resolve(event),
          },
          {
            queryKey: Q.Queries.Actor.list.getKey(
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
            queryFn: Q.Queries.Actor.list.fetch,
          },
          {
            queryKey: Q.Queries.Media.list.getKey(
              {
                pagination: {
                  perPage: media.length,
                  page: 1,
                },
                filter: { ids: media },
              },
              // true,
            ),
            queryFn: Q.Queries.Media.list.fetch,
          },
          {
            queryKey: Q.Queries.Link.list.getKey(
              {
                pagination: {
                  perPage: event.links.length,
                  page: 1,
                },
                filter: event.links.length > 0 ? { ids: event.links } : {},
              },
              // true,
            ),
            queryFn: Q.Queries.Link.list.fetch,
          },
          {
            queryKey: Q.Queries.Area.list.getKey(
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
            queryFn: Q.Queries.Area.list.fetch,
          },
          {
            queryKey: Q.Queries.Keyword.list.getKey(
              // `event-keywords`,
              {
                pagination: { page: 1, perPage: keywords.length },
                filter: {
                  ids: keywords,
                },
              },
              // true,
            ),
            queryFn: Q.Queries.Keyword.list.fetch,
          },
          {
            queryKey: getSearchEventsQueryKey({
              keywords,
              exclude: [event.id],
              _start: 0,
              _end: 3,
            }),
            queryFn: Q.Queries.Event.Custom.SearchEvents.fetch,
          },
          {
            queryKey: getSearchEventsQueryKey({
              actors,
              exclude: [event.id],
              _start: 0,
              _end: 3,
            }),
            queryFn: Q.Queries.Event.Custom.SearchEvents.fetch,
          },
          {
            queryKey: getSearchEventsQueryKey({
              groups,
              _start: 0,
              _end: 3,
              exclude: [event.id],
            }),
            queryFn: Q.Queries.Event.Custom.SearchEvents.fetch,
          },
        ];
      },
  },
  // events
  {
    path: "/events",
    route: () => <EventsPage />,
    queries: (Q, conf) => async (params, query) => {
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

      return Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: getSearchEventsQueryKey({
            ...q,
            hash: undefined,
            _start: 0,
            _end: 0,
          }),
          queryFn: Q.Queries.Event.Custom.SearchEvents.fetch,
        },
        {
          queryKey: Q.Queries.Actor.list.getKey(
            {
              pagination: { page: 1, perPage: q.actors.length },
              filter: { ids: q.actors },
            },
            // true,
          ),
          queryFn: Q.Queries.Actor.list.fetch,
        },
        {
          queryKey: Q.Queries.Group.list.getKey(
            {
              pagination: { page: 1, perPage: q.groups.length },
              filter: { ids: q.groups },
            },
            // true,
          ),
          queryFn: Q.Queries.Group.list.fetch,
        },
        {
          queryKey: Q.Queries.GroupMember.list.getKey(
            {
              pagination: { page: 1, perPage: q.groupsMembers.length },
              filter: { ids: q.groupsMembers },
            },
            // true,
          ),
          queryFn: Q.Queries.GroupMember.list.fetch,
        },
        {
          queryKey: Q.Queries.Keyword.list.getKey(
            {
              pagination: { page: 1, perPage: q.keywords.length },
              sort: { field: "updatedAt", order: "DESC" },
              filter: { ids: q.keywords },
            },
            // true,
          ),
          queryFn: Q.Queries.Keyword.list.fetch,
        },
        {
          queryKey: getSearchEventsInfiniteQueryKey(q),
          queryFn: Q.Queries.Event.Custom.SearchEvents.fetch,
        },
      ]);
    },
  },
  {
    path: "/books",
    route: () => <BooksPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([...commonQueries.flatMap((c) => c(Q, conf))]),
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
    queries: (Q, conf) => async (params: any) => {
      return Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Stats.list.getKey(
            {
              filter: { id: params.keywordId, type: StatsType.types[0].value },
            },
            // true,
          ),
          queryFn: Q.Queries.Stats.list.fetch,
        },
      ]);
    },
  },
  {
    path: "/keywords",
    route: () => <KeywordsPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([...commonQueries.flatMap((c) => c(Q, conf))]),
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
      (Q, conf) =>
      async ({ areaId }: any) =>
        Promise.resolve([
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: Q.Queries.Area.get.getKey({ id: areaId }),
            queryFn: Q.Queries.Area.get.fetch,
          },
        ]),
  },
  {
    path: "/areas",
    route: () => <AreasPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Page.Custom.GetPageContentByPath.getKey("areas"),
          queryFn: Q.Queries.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Queries.Area.list.getKey(
            {
              filter: null,
            },
            // true,
          ),
          queryFn: Q.Queries.Area.list.fetch,
        },
      ]),
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
      (Q, conf) =>
      async ({ mediaId }: any) =>
        Promise.resolve([
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: Q.Queries.Media.get.getKey({ id: mediaId }),
            queryFn: Q.Queries.Media.get.fetch,
          },
        ]),
  },
  {
    path: "/media",
    route: () => <MediaPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Page.Custom.GetPageContentByPath.getKey("media"),
          queryFn: Q.Queries.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Queries.Media.list.getKey(
            {
              filter: null,
            },
            // false,
          ),
          queryFn: Q.Queries.Media.list.fetch,
        },
      ]),
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
    queries: (Q, conf) => async () =>
      Promise.resolve([...commonQueries.flatMap((c) => c(Q, conf))]),
  },
  {
    path: "/stories/:storyId/edit",
    route: () => {
      const params = useParams<{ storyId: string }>();
      if (params.storyId) {
        return <EditStoryPage id={params.storyId} />;
      }
      return <NotFoundPage />;
    },
    queries: (Q, conf) => async () => {
      return Promise.resolve([...commonQueries.flatMap((c) => c(Q, conf))]);
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
      (Q, conf) =>
      async ({ storyPath }: any) => {
        const storyParams = { filter: { path: storyPath } };
        const storyKey = Q.Queries.Story.list.getKey(storyParams);
        const story = await Q.Queries.Story.list
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
        const mostRecentStoriesKey = Q.Queries.Story.list.getKey(
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
        const storyRelatedKeywordsKey = Q.Queries.Keyword.list.getKey(
          storyRelatedKeywordsParams,
        );

        return [
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: storyKey,
            queryFn: () => Promise.resolve(story),
          },
          {
            queryKey: mostRecentStoriesKey,
            queryFn: Q.Queries.Story.list.fetch,
          },
          {
            queryKey: storyRelatedKeywordsKey,
            queryFn: Q.Queries.Keyword.list.fetch,
          },
        ];
      },
  },
  {
    path: "/stories",
    route: () => <BlogPage />,
    queries: (Q, conf) => async () => {
      return Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey:
            Q.Queries.Page.Custom.GetPageContentByPath.getKey("stories"),
          queryFn: Q.Queries.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Queries.Story.list.getKey(
            {
              pagination: { page: 1, perPage: 20 },
              sort: { field: "id", order: "DESC" as const },
              filter: { draft: "false", exclude: [] },
            },
            // false,
          ),
          queryFn: Q.Queries.Story.list.fetch,
        },
      ]);
    },
  },
  // profile
  {
    path: "/profile",
    route: () => <ProfilePage />,
    queries: () => async () => Promise.resolve([]),
  },
  // profile nested routes for react router
  {
    path: import.meta.env?.SSR ? "/profile{/:profilePath}" : "/profile/*",
    route: () => <ProfilePage />,
    queries: () => async () => Promise.resolve([]),
  },
  {
    path: "/logout",
    route: () => <LogoutPage />,
    queries: () => async () => Promise.resolve([]),
  },
  {
    path: "/:customPath",
    route: () => {
      // const params = useParams<{ customPath: string }>();

      // if (params.customPath) {
      //   return <PageTemplate customPath={params.customPath} />;
      // }

      return <NotFoundPage />;
    },
    queries: () => async () => Promise.resolve([]),
  },
  {
    path: "/healthcheck",
    route: () => <div>OK</div>,
    queries: () => async () => Promise.resolve([]),
  },
  {
    path: "/",
    route: () => <IndexPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.map((c) => c(Q, conf)),
        {
          queryKey: Q.Queries.Page.Custom.GetPageContentByPath.getKey("index"),
          queryFn: Q.Queries.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Queries.Keyword.Custom.Distribution.getKey(undefined, {
            _start: "1",
            _end: "50",
          }),
          queryFn: Q.Queries.Keyword.Custom.Distribution.fetch,
        },
        {
          queryKey: getSearchEventsQueryKey({
            hash: `${"Last updated events".trim()}`,
            _sort: "updatedAt",
            _order: "DESC",
            _start: 0,
            _end: 6,
          }),
          queryFn: Q.Queries.Event.Custom.SearchEvents.fetch,
        },
        {
          queryKey: Q.Queries.Media.list.getKey(
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
          queryFn: Q.Queries.Media.list.fetch,
        },
      ]),
  },
];

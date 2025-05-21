import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { DOCUMENTARY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import { type QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import { type Configuration } from "@liexp/ui/lib/context/ConfigurationContext.js";
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
import { type EndpointsQueryProvider } from "@ts-endpoint/tanstack-query";
import { Schema } from "effect";
import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { BooksPage } from "./pages/events/BooksPage.js";

// lazy route components
const NotFoundPage = React.lazy(() => import("./pages/404.js"));
const IndexPage = React.lazy(() => import("./pages/index.js"));
const ActorsPage = React.lazy(() => import("./pages/ActorsPage.js"));
const AreasPage = React.lazy(() => import("./pages/AreasPage.js"));
const CreateStoryPage = React.lazy(
  () => import("./pages/stories/CreateStoryPage.js"),
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
const DocumentariesPage = React.lazy(
  () => import("./pages/events/DocumentariesPage.js"),
);

const RedirectToEventsRoute: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (params.id) {
      void navigate(`/events/${params.id}`);
    }
  }, [params?.id]);

  return null;
};

const githubQuery = (
  _: EndpointsQueryProvider<Endpoints, QueryProviderCustomQueries>,
  conf: Configuration,
): AsyncDataRouteQuery<any, any, any> => ({
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
    const params = useParams<{ linkId: UUID }>();
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
          queryKey: Q.Link.get.getKey({ id: linkId }),
          queryFn: Q.Link.get.fetch,
        },
      ] as AsyncDataRouteQuery<any, any, any>[]),
};

const linksRoute: ServerRoute = {
  path: "/links",
  route: () => <LinksPage />,
  queries: (Q, conf) => async () =>
    Promise.resolve([
      ...commonQueries.flatMap((c) => c(Q, conf)),
      {
        queryKey: Q.Link.list.getKey(undefined),
        queryFn: Q.Link.list.fetch,
      } as AsyncDataRouteQuery<any, any, any>,
    ]),
};

export const routes: ServerRoute[] = [
  // group page
  {
    path: "/groups/:groupId",
    route: () => {
      const params = useParams<{ groupId: UUID }>();
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
            queryKey: Q.Group.get.getKey({ id: groupId }),
            queryFn: Q.Group.get.fetch,
          },
          {
            queryKey: Q.GroupMember.list.getKey(
              undefined,
              {
                group: groupId,
              },
              // false,
            ),
            queryFn: Q.GroupMember.list.fetch,
          },
          {
            queryKey: Q.Stats.list.getKey(undefined, {
              id: groupId,
              type: StatsType.members[2].literals[0],
            }),
            queryFn: Q.Stats.list.fetch,
          },
        ] as AsyncDataRouteQuery<any, any, any>[]),
  },
  // groups
  {
    path: "/groups",
    route: () => <GroupsPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Page.Custom.GetPageContentByPath.getKey("groups"),
          queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Group.list.getKey(
            undefined,
            {
              _sort: "id",
              _order: "ASC",
            },
            // false,
          ),
          queryFn: Q.Group.list.fetch,
        },
      ]),
  },
  // actors page
  {
    path: "/actors/:actorId",
    route: () => {
      const params = useParams<{ actorId: UUID }>();
      if (params.actorId) {
        return <ActorTemplate actorId={params.actorId} />;
      }
      return <NotFoundPage />;
    },
    queries:
      (Q, conf) =>
      ({ actorId }: any) =>
        Promise.resolve([
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: Q.Actor.get.getKey({ id: actorId }),
            queryFn: Q.Actor.get.fetch,
          } as AsyncDataRouteQuery<any, any, any>,
          {
            queryKey: Q.Group.list.getKey(
              undefined,
              {
                members: [actorId],
                _sort: "createdAt",
                _order: "DESC",
                _end: "20",
              },
              // false,
            ),
            queryFn: Q.Group.list.fetch,
          } as AsyncDataRouteQuery<any, any, any>,
          {
            queryKey: Q.Stats.list.getKey(undefined, {
              id: actorId,
              type: StatsType.members[1].literals[0],
            }),
            queryFn: Q.Stats.list.fetch,
          } as AsyncDataRouteQuery<any, any, any>,
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
          queryKey: Q.Page.Custom.GetPageContentByPath.getKey("actors"),
          queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Actor.list.getKey(undefined),
          queryFn: Q.Actor.list.fetch,
        },
      ] as AsyncDataRouteQuery<any, any, any>[]),
  },
  // event page
  {
    path: "/events/:eventId",
    route: () => {
      const params = useParams<{ eventId: UUID }>();
      if (params.eventId) {
        return <EventTemplate eventId={params.eventId} />;
      }

      return <NotFoundPage />;
    },
    queries:
      (Q, conf) =>
      async ({ eventId }: any) => {
        const { data: event } = await Q.Event.get.fetch({ id: eventId });

        const { actors, groups, keywords, media } = getRelationIds(event);

        return [
          ...commonQueries.flatMap((c) => c(Q, conf)),
          {
            queryKey: ["event", { id: eventId }, true, true],
            queryFn: () => Promise.resolve(event),
          },
          {
            queryKey: Q.Actor.list.getKey(
              undefined,
              {
                ids: actors,
                _end: actors.length.toString(),
              },
              true,
            ),
            queryFn: Q.Actor.list.fetch,
          },
          {
            queryKey: Q.Media.list.getKey(
              undefined,
              {
                ids: media,
                _end: media.length.toString(),
              },
              true,
            ),
            queryFn: Q.Media.list.fetch,
          },
          {
            queryKey: Q.Link.list.getKey(
              undefined,
              {
                ids: event.links,
                _end: event.links.length.toString(),
              },
              true,
            ),
            queryFn: Q.Link.list.fetch,
          },
          {
            queryKey: Q.Area.list.getKey(
              undefined,
              {
                ids: Schema.is(UUID)((event.payload as any).location)
                  ? [(event.payload as any).location]
                  : [],
                _end: "1",
              },
              true,
            ),
            queryFn: Q.Area.list.fetch,
          },
          {
            queryKey: Q.Keyword.list.getKey(
              undefined,
              {
                ids: keywords,
                _end: keywords.length.toString(),
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
            queryFn: Q.Event.Custom.SearchEvents.fetch,
          },
          {
            queryKey: getSearchEventsQueryKey({
              actors,
              exclude: [event.id],
              _start: 0,
              _end: 3,
            }),
            queryFn: Q.Event.Custom.SearchEvents.fetch,
          },
          {
            queryKey: getSearchEventsQueryKey({
              groups,
              _start: 0,
              _end: 3,
              exclude: [event.id],
            }),
            queryFn: Q.Event.Custom.SearchEvents.fetch,
          },
        ];
      },
  },
  // events
  {
    path: "/events",
    route: () => <EventsPage />,
    queries: (Q, conf) => async (params, query: any) => {
      const q = hashToQuery(query.hash);

      q.hash = query.hash;
      q.startDate = query.startDate;
      q.endDate = query.endDate;
      q.media = query.media ?? [];
      q.locations = query.locations ?? [];
      q._sort = q._sort ?? "date";
      q.type = q.type ?? EventType.members.map((t) => t.literals[0]);
      q.keywords = q.keywords ?? [];
      q.actors = q.actors ?? [];
      q.groups = q.groups ?? [];
      q.groupsMembers = q.groupsMembers ?? [];

      return Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Event.Custom.SearchEvents.getKey(
            undefined,
            {
              ...q,
              hash: undefined,
              _start: 0,
              _end: 20,
            },
            false,
          ),
          queryFn: Q.Event.Custom.SearchEvents.fetch,
        },
        {
          queryKey: Q.Actor.list.getKey(
            undefined,
            {
              ids: q.actors,
              _end: q.actors.length.toString(),
            },
            // true,
          ),
          queryFn: Q.Actor.list.fetch,
        },
        {
          queryKey: Q.Group.list.getKey(
            undefined,
            {
              ids: q.groups,
              _end: q.groups.length.toString(),
            },
            // true,
          ),
          queryFn: Q.Group.list.fetch,
        },
        {
          queryKey: Q.GroupMember.list.getKey(
            undefined,
            {
              ids: q.groupsMembers,
              _end: q.groupsMembers.length.toString(),
            },
            // true,
          ),
          queryFn: Q.GroupMember.list.fetch,
        },
        {
          queryKey: Q.Keyword.list.getKey(
            undefined,
            {
              ids: q.keywords,
              _sort: "updatedAt",
              _order: "DESC",
              _end: q.keywords.length.toString(),
            },
            // true,
          ),
          queryFn: Q.Keyword.list.fetch,
        },
        {
          queryKey: getSearchEventsInfiniteQueryKey(q),
          queryFn: Q.Event.Custom.SearchEvents.fetch,
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
    path: "/documentaries",
    route: () => <DocumentariesPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Event.Custom.SearchEvents.getKey(
            undefined,
            {
              eventType: [DOCUMENTARY.literals[0]],
              _start: "0",
              _end: "20",
            },
            false,
          ),
          queryFn: Q.Event.Custom.SearchEvents.fetch,
        },
      ]),
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
      const params = useParams<{ keywordId: UUID }>();
      if (params.keywordId) {
        return <KeywordTemplate keywordId={params.keywordId} />;
      }
      return <NotFoundPage />;
    },
    queries: (Q, conf) => async (params: any) => {
      return Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Stats.list.getKey(
            undefined,
            {
              id: params.keywordId,
              type: StatsType.members[0].literals[0],
            },
            // true,
          ),
          queryFn: Q.Stats.list.fetch,
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
      const params = useParams<{ areaId: UUID }>();
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
            queryKey: Q.Area.get.getKey({ id: areaId }),
            queryFn: Q.Area.get.fetch,
          } as AsyncDataRouteQuery<any, any, any>,
        ]),
  },
  {
    path: "/areas",
    route: () => <AreasPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Page.Custom.GetPageContentByPath.getKey("areas"),
          queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Area.list.getKey(undefined, undefined),
          queryFn: Q.Area.list.fetch,
        },
      ]),
  },
  // media
  {
    path: "/media/:mediaId",
    route: () => {
      const params = useParams<{ mediaId: UUID }>();
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
            queryKey: Q.Media.get.getKey({ id: mediaId }),
            queryFn: Q.Media.get.fetch,
          } as AsyncDataRouteQuery<any, any, any>,
        ]),
  },
  {
    path: "/media",
    route: () => <MediaPage />,
    queries: (Q, conf) => async () =>
      Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Page.Custom.GetPageContentByPath.getKey("media"),
          queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Media.list.getKey(undefined, undefined),
          queryFn: Q.Media.list.fetch,
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
        const storyParams = { path: storyPath };
        const storyKey = Q.Story.list.getKey(undefined, storyParams);
        const story = await Q.Story.list
          .fetch(undefined, storyParams)
          .then((r) => r.data[0]);

        const mostRecentStoriesParams = {
          exclude: [story.id],
          _end: "3",
          _sort: "updatedAt",
          _order: "DESC" as const,
        };
        const mostRecentStoriesKey = Q.Story.list.getKey(
          undefined,
          mostRecentStoriesParams,
        );

        const storyRelatedKeywordsParams = {
          ids: story.keywords,
          _end: story.keywords.length.toString(),
          _sort: "updatedAt",
          _order: "DESC" as const,
        };
        const storyRelatedKeywordsKey = Q.Keyword.list.getKey(
          undefined,
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
    queries: (Q, conf) => async () => {
      return Promise.resolve([
        ...commonQueries.flatMap((c) => c(Q, conf)),
        {
          queryKey: Q.Page.Custom.GetPageContentByPath.getKey("stories"),
          queryFn: Q.Page.Custom.GetPageContentByPath.fetch,
        },
        {
          queryKey: Q.Story.list.getKey(
            undefined,
            {
              draft: "false",
              exclude: [],
              _sort: "id",
              _order: "DESC",
              _end: "20",
            },
            // false,
          ),
          queryFn: Q.Story.list.fetch,
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
    path: import.meta.env?.SSR ? "/profile{/:profilePath}" : "/profile",
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
          queryFn: Q.Event.Custom.SearchEvents.fetch,
        },
        {
          queryKey: Q.Media.list.getKey(
            undefined,
            {
              _end: "20",
              _sort: "createdAt",
              _order: "DESC",
            },
            // false,
          ),
          queryFn: Q.Media.list.fetch,
        },
      ]),
  },
];

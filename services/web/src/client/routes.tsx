import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { StatsType } from "@liexp/shared/lib/io/http/Stats";
import { apiProvider } from "@liexp/ui/lib/client/api";
import {
  fetchGroupsMembers,
  getGroupsMembersQueryKey,
} from "@liexp/ui/lib/state/queries/DiscreteQueries";
import {
  fetchSearchEvents,
  fetchSearchEventsInfinite,
  getSearchEventsInfiniteQueryKey,
  getSearchEventsQueryKey,
} from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import {
  defaultGetActorsQueryParams,
  fetchActor,
  fetchActors,
  getActorQueryKey,
  getActorsQueryKey,
} from "@liexp/ui/lib/state/queries/actor.queries";
import {
  fetchArea,
  fetchAreas,
  getAreaQueryKey,
} from "@liexp/ui/lib/state/queries/area.queries";
import {
  fetchStories,
  getStoryQueryKey,
  fetchStoryByPath,
} from "@liexp/ui/lib/state/queries/article.queries";
import { fetchEvent } from "@liexp/ui/lib/state/queries/event.queries";
import { fetchGithubRepo } from "@liexp/ui/lib/state/queries/github";
import {
  fetchGroup,
  fetchGroups,
  getGroupsQueryKey,
} from "@liexp/ui/lib/state/queries/groups.queries";
import {
  fetchKeywords,
  fetchKeywordsDistribution,
  getKeywordsDistributionQueryKey,
  getKeywordsQueryKey,
} from "@liexp/ui/lib/state/queries/keywords.queries";
import {
  defaultGetLinksQueryParams,
  fetchLinks,
  fetchSingleLink,
  getLinkQueryKey,
  getLinksQueryKey,
} from "@liexp/ui/lib/state/queries/link.queries";
import {
  fetchMedia,
  fetchSingleMedia,
  getMediaQueryKey,
  getMediaQueryListKey,
} from "@liexp/ui/lib/state/queries/media.queries";
import {
  fetchPageContentByPath,
  getPageContentByPathQueryKey,
} from "@liexp/ui/lib/state/queries/page.queries";
import {
  fetchStats,
  getStatsQueryKey,
} from "@liexp/ui/lib/state/queries/stats.queries";
import { hashToQuery } from "@liexp/ui/lib/utils/history.utils";
import { UUID } from "io-ts-types/lib/UUID";
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

const linkRoute = {
  path: "/links/:linkId",
  route: () => {
    const params = useParams<{ linkId: string }>();
    if (params.linkId) {
      return <LinkTemplate linkId={params.linkId} />;
    }
    return <NotFoundPage />;
  },
  queries: async ({ linkId }: any) => [
    ...commonQueries,
    {
      queryKey: getLinkQueryKey(linkId),
      queryFn: fetchSingleLink,
    },
  ],
};

const linksRoute = {
  path: "/links",
  route: () => <LinksPage />,
  queries: async () => [
    ...commonQueries,
    {
      queryKey: getLinksQueryKey(defaultGetLinksQueryParams, false),
      queryFn: fetchLinks,
    },
  ],
};

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
          false,
        ),
        queryFn: fetchGroupsMembers,
      },
      {
        queryKey: ["stats", { id: groupId, type: StatsType.types[2].value }],
        queryFn: fetchStats,
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
        queryKey: getPageContentByPathQueryKey({ path: "groups" }),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getGroupsQueryKey(
          `groups`,
          {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          false,
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
          `actor-${actorId}`,
          {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { members: [actorId] },
          },
          false,
        ),
        queryFn: fetchGroups,
      },
      // {
      //   queryKey: useStatsQuery({
      //     id: actorId,
      //     type: StatsType.types[1].value,
      //   }),
      //   queryFn: fetchStats,
      // },
    ],
  },
  // actors
  {
    path: "/actors",
    route: (props: any) => <ActorsPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey({ path: "actors" }),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getActorsQueryKey(
          `actors`,
          defaultGetActorsQueryParams,
          false,
        ),
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
            `event-actors`,
            {
              filter: {
                ids: actors,
              },
              pagination: {
                perPage: actors.length,
                page: 1,
              },
            },
            true,
          ),
          queryFn: fetchActors,
        },

        {
          queryKey: getMediaQueryListKey(
            {
              pagination: {
                perPage: media.length,
                page: 1,
              },
              filter: { ids: media },
            },
            true,
          ),
          queryFn: fetchMedia,
        },
        {
          queryKey: getLinksQueryKey(
            {
              pagination: {
                perPage: event.links.length,
                page: 1,
              },
              filter: event.links.length > 0 ? { ids: event.links } : {},
            },
            true,
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
            true,
          ),
          queryFn: fetchAreas,
        },
        {
          queryKey: getKeywordsQueryKey(
            `event-keywords`,
            {
              pagination: { page: 1, perPage: keywords.length },
              filter: {
                ids: keywords,
              },
            },
            true,
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
            `events-actors`,
            {
              pagination: { page: 1, perPage: q.actors.length },
              filter: { ids: q.actors },
            },
            true,
          ),
          queryFn: fetchActors,
        },
        {
          queryKey: getGroupsQueryKey(
            `events-groups`,
            {
              pagination: { page: 1, perPage: q.groups.length },
              filter: { ids: q.groups },
            },
            true,
          ),
          queryFn: fetchGroups,
        },
        {
          queryKey: getGroupsMembersQueryKey(
            {
              pagination: { page: 1, perPage: q.groupsMembers.length },
              filter: { ids: q.groupsMembers },
            },
            true,
          ),
          queryFn: fetchGroupsMembers,
        },
        {
          queryKey: getKeywordsQueryKey(
            `events-keywords`,
            {
              pagination: { page: 1, perPage: q.keywords.length },
              sort: { field: "updatedAt", order: "DESC" },
              filter: { ids: q.keywords },
            },
            true,
          ),
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
    queries: async (params: any) => {
      return [
        ...commonQueries,
        {
          queryKey: getStatsQueryKey(
            {
              filter: { id: params.keywordId, type: StatsType.types[0].value },
            },
            true,
          ),
          queryFn: fetchStats,
        },
      ];
    },
  },
  {
    path: "/keywords",
    route: () => <KeywordsPage />,
    queries: async () => [...commonQueries],
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
        queryKey: getPageContentByPathQueryKey({ path: "areas" }),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getAreaQueryKey(
          {
            filter: null,
          },
          true,
        ),
        queryFn: fetchAreas,
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
    queries: async ({ mediaId }: any) => [
      ...commonQueries,
      {
        queryKey: getMediaQueryKey(mediaId),
        queryFn: fetchSingleMedia,
      },
    ],
  },
  {
    path: "/media",
    route: () => <MediaPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey({ path: "media" }),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getMediaQueryListKey(
          {
            filter: null,
          },
          false,
        ),
        queryFn: fetchMedia,
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
    queries: async ({ storyPath }: any) => {
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
    queries: async ({ storyId }: any) => {
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
    queries: async ({ storyPath }: any) => {
      const story = await fetchStoryByPath(apiProvider, { path: storyPath });
      return [
        ...commonQueries,
        {
          queryKey: getStoryQueryKey({ filter: { path: storyPath } }, false),
          queryFn: async () => story,
        },
        {
          queryKey: getStoryQueryKey(
            {
              pagination: {
                perPage: 3,
                page: 1,
              },
              sort: { field: "updatedAt", order: "DESC" },
              filter: {
                exclude: [story.id],
              },
            },
            false,
          ),
          queryFn: fetchStories,
        },
        {
          queryKey: getKeywordsQueryKey(
            `story-${story.path}`,
            {
              pagination: {
                perPage: story.keywords.length,
                page: 1,
              },
              sort: { field: "updatedAt", order: "DESC" },
              filter: {
                ids: story.keywords,
              },
            },
            false,
          ),
          queryFn: fetchKeywords,
        },
      ];
    },
  },
  {
    path: "/stories",
    route: () => <BlogPage />,
    queries: async () => {
      return [
        ...commonQueries,
        {
          queryKey: getPageContentByPathQueryKey({ path: "stories" }),
          queryFn: fetchPageContentByPath,
        },
        {
          queryKey: getStoryQueryKey(
            {
              pagination: { page: 1, perPage: 20 },
              sort: { field: "id", order: "DESC" },
              filter: { draft: false, exclude: [] },
            },
            false,
          ),
          queryFn: fetchStories,
        },
      ];
    },
  },
  // profile
  {
    path: "/profile*",
    route: () => <ProfilePage />,
    queries: async () => [],
  },
  {
    path: "/logout",
    route: () => <LogoutPage />,
    queries: async () => [],
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
    queries: async () => [],
  },
  {
    path: "/",
    route: () => <IndexPage />,
    queries: async () => [
      ...commonQueries,
      {
        queryKey: getPageContentByPathQueryKey({ path: "index" }),
        queryFn: fetchPageContentByPath,
      },
      {
        queryKey: getKeywordsDistributionQueryKey({
          _start: 0,
          _end: 50,
        }),
        queryFn: fetchKeywordsDistribution,
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
        queryKey: getMediaQueryListKey(
          {
            pagination: {
              perPage: 20,
              page: 1,
            },
            sort: {
              field: "createdAt",
              order: "DESC",
            },
          },
          false,
        ),
        queryFn: fetchMedia,
      },
    ],
  },
];

import {
  type Actor,
  type Area,
  type Article,
  type Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Link,
  type Media,
  type Page,
  type Project,
} from "@liexp/shared/io/http";
import {
  type GetNetworkParams,
  type GetNetworkQuery,
} from "@liexp/shared/io/http/Network";
import { type APIError } from "@liexp/shared/providers/http/http.provider";
import * as A from "fp-ts/Array";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type * as t from "io-ts";
import type { GetListParams, GetOneParams } from "react-admin";
import { useQuery, type UseQueryResult } from "react-query";
import { type serializedType } from "ts-io-error/lib/Codec";
import {
  articleByPath,
  foldTE,
  jsonData,
  Queries,
} from "../../providers/DataProvider";

export const emptyQuery = (): Promise<any> =>
  Promise.resolve({
    data: [],
    total: 0,
  });

export type FetchQuery<FN extends (...args: any[]) => Promise<any>> = (
  q: any
) => ReturnType<FN>;

export const fetchQuery =
  <P, R>(q: (p: P) => Promise<R>) =>
  async ({ queryKey }: any): Promise<R> => {
    const params = queryKey[1];
    const discrete = queryKey[2];
    if (discrete) {
      if (R.isEmpty(params.filter) || params.filter.ids?.length === 0) {
        return await emptyQuery();
      }
    }

    return await q(params);
  };


export type DiscreteQueryFn<T> = (params: Partial<GetListParams>, discrete: boolean) => UseQueryResult<{ data: T[]; total: number}, APIError>

export const getEventsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "events",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "date",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchEvents: (a: any) => Promise<any> = fetchQuery(
  Queries.Event.getList
);

export const useEventsQuery: DiscreteQueryFn<Events.Event> = (
  params,
  discrete
): UseQueryResult<{ data: Events.Event[]; total: number }, APIError> => {
  return useQuery(getEventsQueryKey(params, discrete), fetchEvents);
};

export const getActorsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "actors",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "fullName",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchActors: FetchQuery<typeof Queries.Actor.getList> = fetchQuery(
  Queries.Actor.getList
);

export const useActorsQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
  return useQuery(getActorsQueryKey(params, discrete), fetchActors);
};

// export const fetchActorsDiscreteQuery = async ({
//   queryKey,
// }: any): Promise<Actor.Actor[]> => {
//   const params = queryKey[1];
//   return R.isEmpty(params.filter) || params.filter.ids?.length === 0
//     ? await emptyQuery()
//     : await Queries.Actor.getList(params);
// };

// export const useActorsDiscreteQuery = (
//   params: Partial<GetListParams>
// ): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
//   return useQuery(getActorsQueryKey(params, true), fetchActorsDiscreteQuery);
// };

export const getActorQueryKey = (p: GetOneParams): [string, GetOneParams] => {
  return ["actor", p];
};

export const fetchActor = async ({ queryKey }: any): Promise<Actor.Actor> =>
  await Queries.Actor.get({ id: queryKey[1].id });

export const useActorQuery = (
  params: GetOneParams
): UseQueryResult<Actor.Actor, APIError> => {
  return useQuery(getActorQueryKey(params), fetchActor);
};

export const getGroupsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "groups",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "updatedAt",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchGroups: FetchQuery<typeof Queries.Group.getList> = fetchQuery(
  Queries.Group.getList
);

export const useGroupsQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Group.Group[]; total: number }, APIError> => {
  return useQuery(getGroupsQueryKey(params, discrete), fetchGroups);
};

export const fetchGroup = async ({ queryKey }: any): Promise<Group.Group> => {
  return await Queries.Group.get({ id: queryKey[1].id });
};

export const useGroupQuery = (
  params: GetOneParams
): UseQueryResult<Group.Group, APIError> => {
  return useQuery(["groups", params], fetchGroup);
};

export const getGroupsMembersQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "groups-members",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "updatedAt",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchGroupsMembers: FetchQuery<
  typeof Queries.GroupMember.getList
> = fetchQuery(Queries.GroupMember.getList);

export const useGroupMembersQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<
  { data: GroupMember.GroupMember[]; total: number },
  APIError
> => {
  return useQuery(
    getGroupsMembersQueryKey(params, discrete),
    fetchGroupsMembers
  );
};

export const fetchKeywords: FetchQuery<typeof Queries.Keyword.getList> =
  fetchQuery(Queries.Keyword.getList);

export const getKeywordsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "keywords",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "createdAt",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const useKeywordsQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(getKeywordsQueryKey(params, discrete), fetchKeywords);
};

export const useKeywordQuery = (
  params: GetOneParams
): UseQueryResult<Keyword.Keyword, APIError> => {
  return useQuery(["keywords", params], async () => {
    return await Queries.Keyword.get(params);
  });
};

export const getKeywordsDistributionQueryKey = (params: any): any[] => {
  return ["keywords", "distribution", params];
};

export const fetchKeywordsDistribution = async ({
  queryKey,
}: any): Promise<{ data: Keyword.Keyword[]; total: number }> => {
  return await Queries.Keyword.Custom.Distribution({ Query: queryKey[2] });
};

export const useKeywordsDistributionQuery = (
  params: any
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(
    getKeywordsDistributionQueryKey(params),
    fetchKeywordsDistribution
  );
};

export const getMediaQueryListKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "media",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        field: "createdAt",
        order: "DESC",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchMedia: FetchQuery<typeof Queries.Media.getList> = fetchQuery(
  Queries.Media.getList
);

export const useMediaQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Media.Media[]; total: number }, any> => {
  return useQuery(getMediaQueryListKey(params, discrete), fetchMedia);
};

export const getMediaQueryKey = (id: string): any[] => ["media", { id }];
export const fetchSingleMedia = fetchQuery(Queries.Media.get);
export const useGetMediaQuery = (
  id: string
): UseQueryResult<Media.Media, any> => {
  return useQuery(getMediaQueryKey(id), fetchSingleMedia);
};

export const getLinkQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "links",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        field: "createdAt",
        order: "DESC",
        ...p.sort,
      },
    },
    discrete,
  ];
};
export const fetchLinks: FetchQuery<typeof Queries.Link.getList> = fetchQuery(
  Queries.Link.getList
);

export const useLinksQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Link.Link[]; total: number }, APIError> => {
  return useQuery(getLinkQueryKey(params, discrete), fetchLinks);
};

export const getPageContentByPathQueryKey = (p: any): any[] => ["pages", p];

export const fetchPageContentByPath = async ({
  queryKey,
}: any): Promise<Page.Page> => {
  const path = queryKey[1].path;
  return await pipe(
    TE.tryCatch(
      () =>
        Queries.Page.getList({
          pagination: {
            page: 1,
            perPage: 1,
          },
          filter: {
            path,
          },
          sort: { field: "createdAt", order: "DESC" },
        }),
      (e) => e as any as APIError
    ),
    TE.map((pages) => A.head(pages.data)),
    TE.chain(
      TE.fromOption(
        (): APIError => ({
          name: `APIError`,
          message: `Page ${path} is missing`,
          details: [],
        })
      )
    ),
    foldTE
  );
};
export const usePageContentByPathQuery = ({
  path,
}: {
  path: string;
}): UseQueryResult<Page.Page, APIError> =>
  useQuery(getPageContentByPathQueryKey({ path }), fetchPageContentByPath);

export const fetchEvent = async ({ queryKey }: any): Promise<Events.Event> =>
  await Queries.Event.get(queryKey[1]);

export const eventQueryKey = (p: GetOneParams): [string, GetOneParams] => [
  "event",
  {
    ...p,
  },
];
export const useEventQuery = (
  params: GetOneParams
): UseQueryResult<Events.Event, any> => {
  return useQuery(eventQueryKey(params), fetchEvent);
};

export const useProjectQuery = (
  params: GetOneParams
): UseQueryResult<Project.Project, any> => {
  return useQuery(["project", params.id], async () => {
    return await Queries.Project.get(params);
  });
};

export const useJSONDataQuery = <A>(
  c: t.Decode<unknown, { data: A }>,
  id: string
): UseQueryResult<{ data: A }, APIError> => {
  return useQuery(["json", id], async () => {
    return await jsonData(c)({ id });
  });
};

export const useGraphQuery = (id: string): UseQueryResult<any, APIError> => {
  return useQuery(["graph", id], async () => {
    return await Queries.Graph.get({ id });
  });
};

export const getAreaQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "areas",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        field: "createdAt",
        order: "DESC",
        ...p.sort,
      },
    },
    discrete,
  ];
};
export const fetchAreas: FetchQuery<typeof Queries.Area.getList> = fetchQuery(
  Queries.Area.getList
);

export const useAreasQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Area.Area[]; total: number }, APIError> => {
  return useQuery(getAreaQueryKey(params, discrete), fetchAreas);
};

export const fetchArea = async ({ queryKey }: any): Promise<Area.Area> => {
  return await Queries.Area.get({ id: queryKey[1].id });
};

export const useAreaQuery = (params: {
  id: string;
}): UseQueryResult<Area.Area, APIError> => {
  return useQuery(["areas", params], fetchArea);
};

export const getArticleQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "articles",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        field: "createdAt",
        order: "DESC",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchArticles = fetchQuery(Queries.Article.getList);

export const useArticlesQuery = (
  params: Partial<GetListParams>,
  discrete: boolean
): UseQueryResult<{ data: Article.Article[]; total: number }, APIError> => {
  return useQuery(getArticleQueryKey(params, discrete), fetchArticles);
};

export const useArticleByPathQuery = ({
  path,
}: {
  path: string;
}): UseQueryResult<Article.Article, APIError> =>
  useQuery(getArticleQueryKey({ filter: { path } }, false), async () => {
    return await articleByPath({ path });
  });

export const getStatsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams, boolean] => {
  return [
    "stats",
    {
      filter: p.filter ?? {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        field: "createdAt",
        order: "DESC",
        ...p.sort,
      },
    },
    discrete,
  ];
};

export const fetchStats = async (params: any): Promise<any> => {
  return await fetchQuery(Queries.Stats.getList)(params).then(
    (results) => results.data[0]
  );
};

export const useStatsQuery = (params: {
  id: string;
  type: string;
}): UseQueryResult<any, APIError> => {
  return useQuery(
    getStatsQueryKey(
      {
        filter: params,
      },
      false
    ),
    fetchStats
  );
};

export const fetchNetworkGraph = async (params: any): Promise<any> => {
  return await fetchQuery(Queries.Networks.get)(params);
};

export const useNetworkGraphQuery = (
  params: GetNetworkParams,
  query: Partial<serializedType<typeof GetNetworkQuery>>
): UseQueryResult<any, APIError> => {
  return useQuery(
    [
      `network-${params.type}-${params.id}`,
      {
        ...params,
        pagination: {
          perPage: 1,
          page: 1,
        },
        sort: {
          order: "DESC",
          field: "date",
        },
        ...query,
        emptyRelations: query.emptyRelations ?? undefined,
      },
    ],
    fetchNetworkGraph
  );
};

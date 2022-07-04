import {
  Actor,
  Area,
  Article,
  Events,
  Group,
  GroupMember,
  Keyword,
  Link,
  Media,
  Page,
  Project,
} from "@liexp/shared/io/http";
import { APIError } from "@liexp/shared/providers/api.provider";
import * as A from "fp-ts/lib/Array";
import * as R from "fp-ts/lib/Record";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { GetListParams, GetOneParams } from "react-admin";
import { useQuery, UseQueryResult } from "react-query";
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

export const getEventsQueryKey = (
  p: Partial<GetListParams>
): [string, GetListParams] => {
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
  ];
};

export const fetchEvents = async ({
  queryKey,
}: any): Promise<Events.Event[]> => {
  const params = queryKey[1];

  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Event.getList(params);
};

export const useEventsQuery = (
  params: GetListParams
): UseQueryResult<{ data: Events.Event[]; total: number }, APIError> => {
  return useQuery(getEventsQueryKey(params), fetchEvents);
};

export const getActorsQueryKey = (
  p: Partial<GetListParams>,
  discrete: boolean
): [string, GetListParams] | [string, GetListParams, string] => {
  return [
    discrete ? "discrete-actors" : "actors",
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
  ];
};

export const fetchActors = async ({
  queryKey,
}: any): Promise<{ data: Actor.Actor[]; total: number }> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Actor.getList(params);
};

export const useActorsQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
  return useQuery(getActorsQueryKey(params, false), fetchActors);
};

export const fetchActorsDiscreteQuery = async ({
  queryKey,
}: any): Promise<Actor.Actor[]> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Actor.getList(params);
};

export const useActorsDiscreteQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
  return useQuery(getActorsQueryKey(params, true), fetchActorsDiscreteQuery);
};


export const getActorQueryKey = (
  p: GetOneParams
): [string, GetOneParams] => {
  return [
    "actor",
    p,
  ];
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
): [string, GetListParams] | [string, GetListParams, string] => {
  return [
    discrete ? "discrete-groups" : "groups",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "updateAt",
        ...p.sort,
      },
    },
  ];
};

export const fetchGroups = async ({
  queryKey,
}: any): Promise<{ data: Group.Group[]; total: number }> => {
  return await Queries.Group.getList(queryKey[1]);
};

export const useGroupsQuery = (
  params: GetListParams
): UseQueryResult<{ data: Group.Group[]; total: number }, APIError> => {
  return useQuery(getGroupsQueryKey(params, false), fetchGroups);
};

export const discreteFetchGroupsDiscrete = async ({
  queryKey,
}: any): Promise<{ data: Group.Group[]; total: number }> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Group.getList(params);
};

export const useGroupsDiscreteQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Group.Group[]; total: number }, APIError> => {
  return useQuery(getGroupsQueryKey(params, true), discreteFetchGroupsDiscrete);
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
): [string, GetListParams] | [string, GetListParams, string] => {
  return [
    discrete ? "discrete-groups-members" : "groups-members",
    {
      filter: p.filter ? p.filter : {},
      pagination: {
        perPage: 20,
        page: 1,
        ...p.pagination,
      },
      sort: {
        order: "DESC",
        field: "updateAt",
        ...p.sort,
      },
    },
  ];
};

export const fetchGroupsMembers = async ({
  queryKey,
}: any): Promise<{ data: GroupMember.GroupMember[]; total: number }> => {
  return await Queries.GroupMember.getList(queryKey[1]);
};

export const useGroupMembersQuery = (
  params: GetListParams
): UseQueryResult<
  { data: GroupMember.GroupMember[]; total: number },
  APIError
> => {
  return useQuery(getGroupsMembersQueryKey(params, false), fetchGroupsMembers);
};

export const discreteFetchGroupsMembers = async ({
  queryKey,
}: any): Promise<{ data: GroupMember.GroupMember[]; total: number }> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.GroupMember.getList(params);
};

export const useGroupsMembersDiscreteQuery = (
  params: Partial<GetListParams>
): UseQueryResult<
  { data: GroupMember.GroupMember[]; total: number },
  APIError
> => {
  return useQuery(
    getGroupsMembersQueryKey(params, true),
    discreteFetchGroupsDiscrete
  );
};

export const fetchKeywords = async ({
  queryKey,
}: any): Promise<{ data: Keyword.Keyword[]; total: number }> => {
  return await Queries.Keyword.getList(queryKey[1]);
};

export const getKeywordsQueryKey = (
  p: Partial<GetListParams>
): [string, GetListParams] => {
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
  ];
};

export const useKeywordsQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(getKeywordsQueryKey(params), fetchKeywords);
};

export const discreteFetchKeywords = async ({
  queryKey,
}: any): Promise<Keyword.Keyword[]> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Keyword.getList(params);
};

export const useKeywordsDiscreteQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(getKeywordsQueryKey(params), discreteFetchKeywords);
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
  return await Queries.Keyword.Custom.Distribution({ Query: queryKey[1] });
};

export const useKeywordsDistributionQuery = (
  params: any
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(
    getKeywordsDistributionQueryKey(params),
    fetchKeywordsDistribution
  );
};

export const getMediaQueryKey = (
  p: Partial<GetListParams>
): [string, GetListParams] => {
  return [
    "media",
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
  ];
};

export const fetchMedia = async ({
  queryKey,
}: any): Promise<{ data: Media.Media[]; total: number }> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Media.getList(params);
};

export const useMediaQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Media.Media[]; total: number }, any> => {
  return useQuery(getMediaQueryKey(params), fetchMedia);
};

export const getLinkQueryKey = (
  p: Partial<GetListParams>
): [string, GetListParams] => {
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
  ];
};
export const fetchLinks = async ({
  queryKey,
}: any): Promise<{ data: Link.Link[]; total: number }> => {
  const params = queryKey[1];
  return R.isEmpty(params.filter) || params.filter.ids?.length === 0
    ? await emptyQuery()
    : await Queries.Link.getList(params);
};

export const useLinksQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Link.Link[]; total: number }, APIError> => {
  return useQuery(getLinkQueryKey(params), fetchLinks);
};

export const getPageContentByPathQueryKey = (p: string): any[] => ["pages", p];

export const fetchPageContentByPath = async ({
  queryKey,
}: any): Promise<Page.Page> => {
  const path = queryKey[1];
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
  useQuery(getPageContentByPathQueryKey(path), fetchPageContentByPath);

export const useArticleByPathQuery = ({
  path,
}: {
  path: string;
}): UseQueryResult<Article.Article, APIError> =>
  useQuery(["articles", path], async () => {
    return await articleByPath({ path });
  });

export const useArticlesQuery = (
  params: GetListParams
): UseQueryResult<{ data: Article.Article[]; total: number }, APIError> => {
  return useQuery(["articles"], async () => {
    return R.isEmpty(params.filter) || params.filter.ids?.length === 0
      ? await emptyQuery()
      : await Queries.Article.getList(params);
  });
};

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
  p: Partial<GetListParams>
): [string, GetListParams] => {
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
  ];
};
export const fetchAreas = async ({
  queryKey,
}: any): Promise<{ data: Area.Area[]; total: number }> => {
  const params = queryKey[1];
  return !R.isEmpty(params.filter) || params.filter === null
    ? await Queries.Area.getList(params)
    : await emptyQuery();
};

export const useAreasQuery = (
  params: Partial<GetListParams>
): UseQueryResult<{ data: Area.Area[]; total: number }, APIError> => {
  return useQuery(getAreaQueryKey(params), fetchAreas);
};

export const fetchArea = async ({ queryKey }: any): Promise<Area.Area> => {
  return await Queries.Area.get({ id: queryKey[1].id });
};

export const useAreaQuery = (params: {
  id: string;
}): UseQueryResult<Area.Area, APIError> => {
  return useQuery(["areas", params], fetchArea);
};

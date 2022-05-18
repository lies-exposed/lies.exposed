import {
  Actor,
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

export const useEventsQuery = (
  params: GetListParams
): UseQueryResult<{ data: Events.Event[]; total: number }, APIError> => {
  return useQuery(["events"], async () => {
    return R.isEmpty(params.filter) || params.filter.ids?.length === 0
      ? await emptyQuery()
      : await Queries.Event.getList(params);
  });
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
  params: GetListParams
): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
  return useQuery(["actors", params], fetchActors);
};

export const useActorsDiscreteQuery = (
  params: GetListParams
): UseQueryResult<{ data: Actor.Actor[]; total: number }, APIError> => {
  return useQuery(["discrete", "actors", params.filter], async () => {
    return R.isEmpty(params.filter) || params.filter.ids?.length === 0
      ? await emptyQuery()
      : await Queries.Actor.getList(params);
  });
};

export const fetchActor = async ({ queryKey }: any): Promise<Actor.Actor> =>
  await Queries.Actor.get({ id: queryKey[1].id });

export const useActorQuery = (
  params: GetOneParams
): UseQueryResult<Actor.Actor, APIError> => {
  return useQuery(["actors", params], fetchActor);
};

export const fetchGroups = async ({
  queryKey,
}: any): Promise<{ data: Group.Group[]; total: number }> => {
  return await Queries.Group.getList(queryKey[1]);
};

export const useGroupsQuery = (
  params: GetListParams
): UseQueryResult<{ data: Group.Group[]; total: number }, APIError> => {
  return useQuery(["groups", params], fetchGroups);
};

export const useGroupsDiscreteQuery = (
  params: GetListParams
): UseQueryResult<{ data: Group.Group[]; total: number }, APIError> => {
  return useQuery(["discrete", "groups", params.filter], async () => {
    return R.isEmpty(params.filter) || params.filter.ids?.length === 0
      ? await emptyQuery()
      : await Queries.Group.getList(params);
  });
};

export const fetchGroup = async ({ queryKey }: any): Promise<Group.Group> => {
  return await Queries.Group.get({ id: queryKey[1].id });
};

export const useGroupQuery = (
  params: GetOneParams
): UseQueryResult<Group.Group, APIError> => {
  return useQuery(["groups", params], fetchGroup);
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
  return useQuery(["groups-members", params], fetchGroupsMembers);
};

export const useGroupsMembersDiscreteQuery = (
  params: GetListParams
): UseQueryResult<
  { data: GroupMember.GroupMember[]; total: number },
  APIError
> => {
  return useQuery(["discrete", "groups-members", params.filter], async () => {
    return R.isEmpty(params.filter) || params.filter.ids?.length === 0
      ? await emptyQuery()
      : await Queries.GroupMember.getList(params);
  });
};

export const fetchKeywords = async ({
  queryKey,
}: any): Promise<{ data: Keyword.Keyword[]; total: number }> => {
  return await Queries.Keyword.getList(queryKey[1]);
};

export const useKeywordsQuery = (
  params: GetListParams
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(["keywords", params], fetchKeywords);
};

export const useKeywordsDiscreteQuery = (
  params: GetListParams
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(["keywords", params.filter], async () => {
    return R.isEmpty(params.filter) || params.filter.ids?.length === 0
      ? await emptyQuery()
      : await Queries.Keyword.getList(params);
  });
};

export const useKeywordQuery = (
  params: GetOneParams
): UseQueryResult<Keyword.Keyword, APIError> => {
  return useQuery(["keywords", params], async () => {
    return await Queries.Keyword.get(params);
  });
};

export const useKeywordsDistributionQuery = (
  params: any
): UseQueryResult<{ data: Keyword.Keyword[]; total: number }, APIError> => {
  return useQuery(
    ["keywords", "distribution", params],
    async ({ queryKey }) => {
      return await Queries.Keyword.Custom.Distribution({ Query: queryKey[1] });
    }
  );
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
  params: GetListParams
): UseQueryResult<{ data: Media.Media[]; total: number }, any> => {
  return useQuery(["media", params], fetchMedia);
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
  params: GetListParams
): UseQueryResult<{ data: Link.Link[]; total: number }, APIError> => {
  return useQuery(["links", params], fetchLinks);
};

export const usePageContentByPathQuery = ({
  path,
}: {
  path: string;
}): UseQueryResult<Page.Page, APIError> =>
  useQuery(["pages", path], async () => {
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
  });

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

export const useEventQuery = (
  params: GetOneParams
): UseQueryResult<Events.Event, any> => {
  return useQuery(["event", params], fetchEvent);
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

import { GetLogger } from "@liexp/core/lib/logger/index.js";
import {
  getNewRelationIds,
  updateCache,
  type SearchEventsQueryCache,
} from "@liexp/shared/lib/helpers/event/search-event.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { type GetSearchEventsQueryInput } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEventsQuery.js";
import {
  type Actor,
  type Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Link,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { type API } from "@liexp/shared/lib/providers/api/api.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

const log = GetLogger("search-events-query");

export const toKey = (cachePrefix: string, hash?: string): string => {
  const cacheKey = hash ? `${cachePrefix}-${hash}` : cachePrefix;
  return cacheKey;
};

export interface SearchEventQueryResult {
  events: Events.SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
  totals: EventTotals;
  firstDate?: string;
  lastDate?: string;
  total: number;
}

const initialSearchEventsQueryCache: SearchEventsQueryCache = {
  events: [],
  actors: new Map(),
  groups: new Map(),
  groupsMembers: new Map(),
  media: new Map(),
  keywords: new Map(),
  links: new Map(),
  areas: new Map(),
};

let searchEventsQueryCache: SearchEventsQueryCache =
  initialSearchEventsQueryCache;

export const clearSearchEventsQueryCache = (): void => {
  searchEventsQueryCache = initialSearchEventsQueryCache;
};

export const fetchRelations =
  (api: API) =>
  ({
    actors,
    groups,
    groupsMembers,
    media,
    keywords,
    links,
  }: Events.EventRelationIds): TE.TaskEither<
    APIError,
    {
      actors: { data: Actor.Actor[] };
      groups: { data: Group.Group[] };
      groupsMembers: { data: GroupMember.GroupMember[] };
      keywords: { data: Keyword.Keyword[] };
      media: { data: Media.Media[] };
      links: { data: Link.Link[] };
    }
  > => {
    return sequenceS(TE.ApplicativePar)({
      actors:
        actors.length === 0
          ? TE.right({ data: [] })
          : api.Actor.List({
              Query: {
                ids: actors,
              },
            }),
      groups:
        groups.length === 0
          ? TE.right({ data: [] })
          : api.Group.List({
              Query: {
                ids: groups,
              },
            }),
      groupsMembers:
        groupsMembers.length === 0
          ? TE.right({ data: [] })
          : api.GroupMember.List({
              Query: {
                ids: groupsMembers,
              },
            }),
      media:
        media.length === 0
          ? TE.right({ data: [] })
          : api.Media.List({
              Query: {
                ids: media,
              },
            }),
      keywords:
        keywords.length === 0
          ? TE.right({ data: [] })
          : api.Keyword.List({
              Query: {
                ids: keywords,
              },
            }),
      links:
        links.length === 0
          ? TE.right({ data: [] })
          : api.Link.List({
              Query: {
                ids: links,
              },
            }),
    });
  };

export interface SearchEventQueryInput
  extends Omit<Partial<GetSearchEventsQueryInput>, "_start" | "_end"> {
  _start: number;
  _end: number;
  hash: string;
  slide?: boolean;
}

export type SearchEventsQueryInputNoPagination = Omit<
  SearchEventQueryInput,
  "_start" | "_end"
>;

const searchEventsQ =
  (api: API) =>
  ({
    _start,
    _end,
    hash,
    ...query
  }: SearchEventQueryInput): TE.TaskEither<
    APIError,
    SearchEventQueryResult
  > => {
    log.debug.log("Search events for %s from %d to %d", _start, _end);

    return pipe(
      api.Event.List({
        Query: {
          ...query,
          _start,
          _end,
        } as any,
      }),
      TE.mapLeft((e) => {
        log.error.log(`API Error %O`, e.details);
        return e;
      }),
      TE.chain(({ data, firstDate, lastDate, ...response }) => {
        log.debug.log("API response %O", { data, response });

        return pipe(
          getNewRelationIds(data, searchEventsQueryCache),
          TE.right,
          TE.chain(fetchRelations(api)),
          TE.map(
            ({ actors, groups, groupsMembers, media, keywords, links }) => {
              searchEventsQueryCache = updateCache(searchEventsQueryCache, {
                events: { data, ...response },
                actors: actors.data,
                groups: groups.data,
                groupsMembers: groupsMembers.data,
                media: media.data,
                keywords: keywords.data,
                links: links.data,
                areas: [],
              });

              return {
                ...response,
                actors: actors.data,
                groups: groups.data,
                groupsMembers: groupsMembers.data,
                media: media.data,
                keywords: keywords.data,
                links: links.data,
                events: searchEventsQueryCache.events,
                firstDate,
                lastDate,
              };
            },
          ),
        );
      }),
    );
  };

export const getSearchEventsQueryKey = (
  p: Partial<SearchEventQueryInput>,
): [string, any, any, any] => {
  return ["events-search", { _start: 0, _end: 20, ...p }, undefined, undefined];
};

export const fetchSearchEvents =
  (api: API) =>
  (ctx: any): Promise<SearchEventQueryResult> => {
    const params = ctx.queryKey[1];
    return pipe(searchEventsQ(api)(params), throwTE);
  };

export const searchEventsQuery = (
  api: API,
): ((
  input: SearchEventQueryInput,
) => UseQueryResult<SearchEventQueryResult, APIError>) => {
  const searchQueryFn = fetchSearchEvents(api);

  return (input) => {
    return useQuery({
      queryKey: getSearchEventsQueryKey(input),
      queryFn: searchQueryFn,
      // refetchOnWindowFocus: false,
    });
  };
};

export const getSearchEventsInfiniteQueryKey = (
  input: Partial<SearchEventQueryInput>,
): [string, Partial<SearchEventQueryInput>, unknown, unknown] => {
  return ["events-search-infinite", input, undefined, undefined];
};

export const fetchSearchEventsInfinite =
  (api: API) =>
  ({ queryKey, pageParam }: any): Promise<SearchEventQueryResult> => {
    const params = queryKey[1];
    return pipe(
      searchEventsQ(api)({
        ...params,
        _start: pageParam?.startIndex ?? 0,
        _end: pageParam?.stopIndex ?? 20,
      }),
      throwTE,
    );
  };

export const searchEventsInfiniteQuery =
  (api: API) =>
  (
    input: Partial<SearchEventQueryInput>,
  ): UseInfiniteQueryResult<
    { pages: SearchEventQueryResult[]; lastPage: SearchEventQueryResult },
    APIError
  > => {
    return useInfiniteQuery({
      initialPageParam: { startIndex: 0, stopIndex: 20 },
      queryKey: getSearchEventsInfiniteQueryKey(input),
      queryFn: fetchSearchEventsInfinite(api),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getNextPageParam: (lastPage, allPages) => {
        const loadedEvents = allPages
          .map((p) => p.events)
          .reduce((acc, ev) => acc + ev.length, 0);

        if (loadedEvents >= lastPage.total) {
          return undefined;
        }

        return { startIndex: loadedEvents, stopIndex: loadedEvents + 20 };
      },
    });
  };

export const getEventsFromLinkQuery =
  (api: API) =>
  ({ url }: { url: string }): UseQueryResult<any, APIError> => {
    return useQuery({
      queryKey: ["events-from-link", url],
      queryFn: async () => {
        return pipe(
          api.Event.Custom.GetFromLink({
            Query: {
              url,
              _start: 0,
              _end: 20,
            },
          } as any),
          TE.chain(({ data, suggestions, total, totals }) => {
            return pipe(
              getNewRelationIds(data, searchEventsQueryCache),
              TE.right,
              TE.chain(fetchRelations(api)),
              TE.map(
                ({ actors, groups, groupsMembers, media, keywords, links }) => {
                  searchEventsQueryCache = updateCache(searchEventsQueryCache, {
                    events: { data, total, totals },
                    actors: actors.data,
                    groups: groups.data,
                    groupsMembers: groupsMembers.data,
                    media: media.data,
                    keywords: keywords.data,
                    links: links.data,
                    areas: [],
                  });

                  return searchEventsQueryCache.events;
                },
              ),
            );
          }),
          throwTE,
        );
      },
    });
  };

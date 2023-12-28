import { GetLogger } from "@liexp/core/lib/logger";
import { type ListEventOutput } from "@liexp/shared/lib/endpoints/events/event.endpoints";
import {
  getNewRelationIds,
  updateCache,
  type SearchEventsQueryCache,
} from "@liexp/shared/lib/helpers/event/search-event";
import {
  type Actor,
  type Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Link,
  type Media,
} from "@liexp/shared/lib/io/http";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals";
import { type GetSearchEventsQueryInput } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEventsQuery";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from "react-query";
import { api } from "../api";

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

// const getStateByHash = (
//   hash: string,
//   _end: number
// ): O.Option<SearchEventQueryResult> => {
//   return pipe(
//     searchEventsQueryCache.hashes,
//     M.lookup(S.Eq)(hash),
//     O.filter((r) => r.events.length > _end)
//   );
// };

// const buildFromCache = (hash: string, page: number): SearchEventQueryResult => {
//   return pipe(getStateByHash(hash), (state) =>
//     pipe(state.events, A.takeLeft(page * 20), (events) =>
//       toQueryResult(events, state)
//     )
//   );
// };

export const fetchRelations = ({
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
              _start: 0,
              perPage: actors.length,
              ids: actors,
            } as any,
          }),
    groups:
      groups.length === 0
        ? TE.right({ data: [] })
        : api.Group.List({
            Query: {
              ids: groups,
            } as any,
          }),
    groupsMembers:
      groupsMembers.length === 0
        ? TE.right({ data: [] })
        : api.GroupMember.List({
            Query: {
              ids: groupsMembers,
            } as any,
          }),
    media:
      media.length === 0
        ? TE.right({ data: [] })
        : api.Media.List({
            Query: {
              ids: media,
            } as any,
          }),
    keywords:
      keywords.length === 0
        ? TE.right({ data: [] })
        : api.Keyword.List({
            Query: {
              ids: keywords,
            } as any,
          }),
    links:
      links.length === 0
        ? TE.right({ data: [] })
        : api.Link.List({
            Query: {
              ids: links,
            } as any,
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

export interface SearchEventsQueryInputNoPagination
  extends Omit<SearchEventQueryInput, "_start" | "_end"> {}

const searchEventsQ =
  (getEvents: (input: any) => TE.TaskEither<APIError, ListEventOutput>) =>
  ({
    _start,
    _end,
    hash,
    ...query
  }: SearchEventQueryInput): TE.TaskEither<
    APIError,
    SearchEventQueryResult
  > => {
    // log.debug.log("Search events for %s from %d to %d", _start, _end);

    return pipe(
      getEvents({
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
      TE.chain(({ data, ...response }) => {
        // log.debug.log("[%s] API response %O", { data, response });

        return pipe(
          getNewRelationIds(data, searchEventsQueryCache),
          TE.right,
          TE.chain(fetchRelations),
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
              };
            },
          ),
        );
      }),
    );
  };

export const getSearchEventsQueryKey = (
  p: Partial<SearchEventQueryInput>,
): [string, any] => {
  return ["events-search", { _start: 0, _end: 20, ...p }];
};

export const fetchSearchEvents = async ({
  queryKey,
}: any): Promise<SearchEventQueryResult> => {
  const params = queryKey[1];
  return await pipe(searchEventsQ(api.Event.List)(params), throwTE);
};
export const searchEventsQuery = (
  input: SearchEventQueryInput,
): UseQueryResult<SearchEventQueryResult, APIError> => {
  return useQuery(getSearchEventsQueryKey(input), fetchSearchEvents, {
    refetchOnWindowFocus: false,
    optimisticResults: false,
  });
};

export const getSearchEventsInfiniteQueryKey = (
  input: any,
): [string, SearchEventQueryInput] => {
  return ["events-search-infinite", input];
};

export const fetchSearchEventsInfinite = async ({
  queryKey,
  pageParam,
}: any): Promise<SearchEventQueryResult> => {
  const params = queryKey[1];
  return await pipe(
    searchEventsQ(api.Event.List)({
      ...params,
      _start: pageParam?.startIndex ?? 0,
      _end: pageParam?.stopIndex ?? 20,
    }),
    throwTE,
  );
};

export const searchEventsInfiniteQuery = (
  input: Partial<SearchEventQueryInput>,
): UseInfiniteQueryResult<SearchEventQueryResult, APIError> => {
  return useInfiniteQuery(
    getSearchEventsInfiniteQueryKey(input),
    fetchSearchEventsInfinite,
    {
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
    },
  );
};

export const getEventsFromLinkQuery = ({
  url,
}: {
  url: string;
}): UseQueryResult<any, APIError> => {
  return useQuery(["events-from-link", url], async () => {
    return await pipe(
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
          TE.chain(fetchRelations),
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
  });
};

import { GetLogger } from "@liexp/core/logger";
import { ListEventOutput } from "@liexp/shared/endpoints/event.endpoints";
import { getRelationIds } from "@liexp/shared/helpers/event";
import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
  Media,
} from "@liexp/shared/io/http";
import { GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { APIError } from "@liexp/shared/providers/api.provider";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as M from "fp-ts/lib/Map";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
} from "react-query";
import { foldTE } from "../../providers/DataProvider";
import { api } from "../api";

const log = GetLogger("search-events-query");

export const toKey = (cachePrefix: string, hash?: string): string => {
  const cacheKey = hash ? `${cachePrefix}-${hash}` : cachePrefix;
  return cacheKey;
};

export interface EventTotals {
  uncategorized: number;
  deaths: number;
  scientificStudies: number;
  patents: number;
  documentaries: number;
  transactions: number;
}

export interface SearchEventQueryResult {
  events: Events.SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  totals: EventTotals;
  total: number;
}

interface SearchEventsQueryCache {
  events: Events.SearchEvent.SearchEvent[];
  actors: Map<string, Actor.Actor>;
  groups: Map<string, Group.Group>;
  groupsMembers: Map<string, GroupMember.GroupMember>;
  media: Map<string, Media.Media>;
  keywords: Map<string, Keyword.Keyword>;
}

const initialSearchEventsQueryCache: SearchEventsQueryCache = {
  events: [],
  actors: new Map(),
  groups: new Map(),
  groupsMembers: new Map(),
  media: new Map(),
  keywords: new Map(),
};
let searchEventsQueryCache: SearchEventsQueryCache =
  initialSearchEventsQueryCache;

export const clearSearchEventsQueryCache = (): void => {
  searchEventsQueryCache = initialSearchEventsQueryCache;
};

interface EventRelationIds {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  media: string[];
  keywords: string[];
}

const getNewRelationIds = (
  events: Events.Event[],
  s: SearchEventsQueryCache
): EventRelationIds => {
  const actorIds = pipe(s.actors, M.keys(S.Ord));
  const groupIds = pipe(s.groups, M.keys(S.Ord));
  const groupsMemberIds = pipe(s.groupsMembers, M.keys(S.Ord));
  const mediaIds = pipe(s.media, M.keys(S.Ord));
  const keywordIds = M.keys(S.Ord)(s.keywords);

  const init: EventRelationIds = {
    actors: [],
    groups: [],
    groupsMembers: [],
    media: [],
    keywords: [],
  };
  return pipe(
    events,
    A.reduce(init, (acc, e) => {
      const { actors, groups, groupsMembers, media, keywords } =
        getRelationIds(e);
      log.debug.log("actors", actors);

      const newActors = actors.filter(
        (a) => ![...actorIds, ...acc.actors].includes(a)
      );
      log.debug.log("new actors", newActors);
      const newGroups = groups.filter(
        (a) => ![...groupIds, ...acc.groups].includes(a)
      );
      const newGroupsMembers = groupsMembers.filter(
        (g) => ![...groupsMemberIds, ...acc.groupsMembers].includes(g)
      );
      const newMediaIds = media.filter(
        (m) => ![...acc.media, ...mediaIds].includes(m)
      );
      const newKeywordIds = keywords.filter(
        (k) => ![...keywordIds, ...acc.keywords].includes(k)
      );

      return {
        actors: acc.actors.concat(newActors),
        groups: acc.groups.concat(newGroups),
        groupsMembers: acc.groupsMembers.concat(newGroupsMembers),
        media: acc.media.concat(newMediaIds),
        keywords: acc.keywords.concat(newKeywordIds),
      };
    })
  );
};

const mergeState = (
  s: SearchEventsQueryCache,
  update: {
    events: { data: Events.Event[]; total: number; totals: EventTotals };
    actors: Actor.Actor[];
    groups: Group.Group[];
    groupsMembers: GroupMember.GroupMember[];
    media: Media.Media[];
    keywords: Keyword.Keyword[];
  }
): SearchEventsQueryCache => {
  const actors = pipe(
    update.actors,
    A.reduce(s.actors, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    })
  );

  log.debug.log("merge state: actors", actors);

  const groups = pipe(
    update.groups,
    A.reduce(s.groups, (accGroups, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accGroups);
    })
  );

  const groupsMembers = pipe(
    update.groupsMembers,
    A.reduce(s.groupsMembers, (accGroupsMembers, gm) => {
      return M.upsertAt(S.Eq)(gm.id, gm)(accGroupsMembers);
    })
  );

  const media = pipe(
    update.media,
    A.reduce(s.media, (accMedia, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accMedia);
    })
  );

  const keywords = pipe(
    update.keywords,
    A.reduce(s.keywords, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    })
  );

  const newEvents = toSearchEvent(update.events.data, {
    events: s.events,
    actors,
    groups,
    groupsMembers,
    media,
    keywords,
  });

  return {
    events: newEvents,
    actors,
    groups,
    groupsMembers,
    media,
    keywords,
  };
};

const toSearchEvent = (
  events: Events.Event[],
  s: SearchEventsQueryCache
): Events.SearchEvent.SearchEvent[] => {
  return pipe(
    events,
    A.reduce([] as Events.SearchEvent.SearchEvent[], (acc, e) => {
      const {
        actors: actorIds,
        groups: groupIds,
        groupsMembers: groupsMembersIds,
        media: mediaIds,
        keywords: keywordIds,
      } = getRelationIds(e);

      log.debug.log("Relation Ids %O", { actors: actorIds });
      const actors = pipe(
        actorIds,
        A.map((a) => pipe(s.actors, M.lookup(S.Eq)(a))),
        A.compact
      );

      const groups = pipe(
        groupIds,
        A.map((a) => pipe(s.groups, M.lookup(S.Eq)(a))),
        A.compact
      );

      const groupsMembers = pipe(
        groupsMembersIds,
        A.map((a) => pipe(s.groupsMembers, M.lookup(S.Eq)(a))),
        A.compact
      );

      const media = pipe(
        mediaIds,
        A.map((a) => pipe(s.media, M.lookup(S.Eq)(a))),
        A.compact
      );

      const keywords = pipe(
        keywordIds,
        A.map((a) => pipe(s.keywords, M.lookup(S.Eq)(a))),
        A.compact
      );

      switch (e.type) {
        case Events.EventType.types[0].value: {
          return acc.concat([
            {
              ...e,
              payload: {
                ...e.payload,
                victim: actors[0],
              },
              media,
              keywords,
            },
          ]);
        }
        case Events.EventType.types[2].value: {
          return acc.concat([
            {
              ...e,
              payload: {
                ...e.payload,
                authors: actors,
                publisher: groups[0],
              },
              media,
              keywords,
            },
          ]);
        }
        case Events.EventType.types[3].value: {
          return acc.concat([
            {
              ...e,
              payload: {
                ...e.payload,
                owners: { actors, groups },
              },
              media,
              keywords,
            },
          ]);
        }
        case Events.EventType.types[4].value: {
          return acc.concat([
            {
              ...e,
              payload: {
                ...e.payload,
                media: media.find((m) => m.id === e.payload.media) ?? media[0],
                authors: {
                  actors: actors.filter((a) =>
                    e.payload.authors.actors.includes(a.id)
                  ),
                  groups: groups.filter((g) =>
                    e.payload.authors.groups.includes(g.id)
                  ),
                },
                subjects: {
                  actors: actors.filter((a) =>
                    e.payload.subjects.actors.includes(a.id)
                  ),
                  groups: groups.filter((g) =>
                    e.payload.subjects.groups.includes(g.id)
                  ),
                },
              },
              media,
              keywords,
            },
          ]);
        }
        case Events.EventType.types[5].value: {
          const from =
            e.payload.from.type === "Group"
              ? groups.find((g) => g.id === e.payload.from.id)
              : actors.find((a) => a.id === e.payload.from.id);

          const to =
            e.payload.to.type === "Group"
              ? groups.find((g) => g.id === e.payload.to.id)
              : actors.find((a) => a.id === e.payload.to.id);

          return acc.concat([
            {
              ...e,
              payload: {
                ...e.payload,
                from: { ...e.payload.from, id: from as any },
                to: { ...e.payload.to, id: to as any },
              },
              media,
              keywords,
            },
          ]);
        }
        default: {
          return acc.concat([
            {
              ...e,
              payload: {
                ...e.payload,
                actors,
                groups,
                groupsMembers,
              },
              media,
              keywords,
            },
          ]);
        }
      }
    })
  );
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

const fetchRelations = ({
  actors,
  groups,
  groupsMembers,
  media,
  keywords,
}: EventRelationIds): TE.TaskEither<
  APIError,
  {
    actors: { data: Actor.Actor[] };
    groups: { data: Group.Group[] };
    groupsMembers: { data: GroupMember.GroupMember[] };
    keywords: { data: Keyword.Keyword[] };
    media: { data: Media.Media[] };
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
  });
};

export interface SearchEventQueryInput
  extends Omit<Partial<GetSearchEventsQueryInput>, "_start" | "_end"> {
  _start: number;
  _end: number;
  hash: string;
}

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
    log.debug.log("Search events for %s from %d to %d", _start, _end);

    return pipe(
      getEvents({
        Query: {
          ...query,
          _start,
          _end: _end,
        } as any,
      }),
      TE.mapLeft((e) => {
        log.error.log(`API Error %O`, e.details);
        return e;
      }),
      TE.chain(({ data, ...response }) => {
        log.debug.log("[%s] API response %O", { data, response });

        return pipe(
          getNewRelationIds(data, searchEventsQueryCache),
          TE.right,
          TE.chain(fetchRelations),
          TE.map(({ actors, groups, groupsMembers, media, keywords }) => {
            searchEventsQueryCache = mergeState(searchEventsQueryCache, {
              events: { data, ...response },
              actors: actors.data,
              groups: groups.data,
              groupsMembers: groupsMembers.data,
              media: media.data,
              keywords: keywords.data,
            });

            return {
              ...response,
              actors: actors.data,
              groups: groups.data,
              groupsMembers: groupsMembers.data,
              media: media.data,
              keywords: keywords.data,
              events: searchEventsQueryCache.events,
            };
          })
        );
      })
    );
  };

export const searchEventsQuery = (
  input: any
): UseQueryResult<SearchEventQueryResult, APIError> => {
  return useQuery(
    ["events", "search", input],
    async () => {
      return await pipe(searchEventsQ(api.Event.List)(input), foldTE);
    },
    { refetchOnWindowFocus: false, optimisticResults: false }
  );
};

export const searchEventsInfiniteQuery = (
  input: any
): UseInfiniteQueryResult<SearchEventQueryResult, APIError> => {
  return useInfiniteQuery(
    ["events-search-infinite", input.hash],
    async (params) => {
      return await pipe(
        searchEventsQ(api.Event.List)({
          ...input,
          _start: params.pageParam?.startIndex ?? 0,
          _end: params.pageParam?.stopIndex ?? 20,
        }),
        foldTE
      );
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const loadedEvents = allPages
          .map((p) => p.events)
          .reduce((acc, ev) => acc + ev.length, 0);

        if (loadedEvents >= lastPage.total) {
          return undefined;
        }

        return { startIndex: loadedEvents, stopIndex: loadedEvents + 20 };
      },
    }
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
          TE.map(({ actors, groups, groupsMembers, media, keywords }) => {
            searchEventsQueryCache = mergeState(searchEventsQueryCache, {
              events: { data, total, totals },
              actors: actors.data,
              groups: groups.data,
              groupsMembers: groupsMembers.data,
              media: media.data,
              keywords: keywords.data,
            });

            return searchEventsQueryCache.events;
          })
        );
      }),
      foldTE
    );
  });
};

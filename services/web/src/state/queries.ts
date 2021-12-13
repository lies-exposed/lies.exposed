/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Events } from "@econnessione/shared/io/http";
import { APIError } from "@econnessione/shared/providers/api.provider";
import { queryStrict, refetch } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { api } from "../api";
import { EventsView } from "../utils/location.utils";
import { stateLogger } from "../utils/logger.utils";
import { toKey } from "../utils/state.utils";

export const IL_EVENT_KEY_PREFIX = "events";
export const IL_DEATH_KEY_PREFIX = "deaths";
export const IL_NETWORK_KEY_PREFIX = "network";
export const IL_ACTORS_KEY_PREFIX = "actors";
export const IL_SCIENTIFIC_STUDIES_KEY_PREFIX = "scientific-studies";

export type InfiniteEventListParams = Omit<EventsView, "view">;
export interface InfiniteDeathsListParam {
  minDate?: string;
  maxDate?: string;
  victim?: string[];
  page?: number;
  hash?: string;
}

export interface InfiniteEventListMetadata {
  actors: UUID[];
  groups: UUID[];
  keywords: UUID[];
  groupsMembers: UUID[];
  media: UUID[];
}

export const infiniteListCache: { [key: string]: { [page: number]: any } } = {};

const getFromCache = <T extends t.Any, M>(
  cacheKey: string,
  p: number
): TE.TaskEither<APIError, (t.TypeOf<T> & { metadata: M }) | undefined> =>
  TE.fromIO<(t.TypeOf<T> & { metadata: M }) | undefined, APIError>(() => {
    const cache = infiniteListCache[cacheKey]?.[p];
    stateLogger.debug.log(`[%s] Cache for page %d %O`, cacheKey, p, cache);
    return cache;
  });

const buildFromCache = <T extends t.Any, M>(
  cacheKey: string,
  page: number,
  empty: M
): TE.TaskEither<APIError, t.TypeOf<T> & { metadata: M }> => {
  return TE.fromIO<t.TypeOf<T> & { metadata: M }, APIError>(() => {
    stateLogger.debug.log(
      "[%s] Build data from cache until page %d",
      cacheKey,
      page
    );
    const storedResponse = pipe(
      infiniteListCache[cacheKey] ?? {},
      Object.entries,
      (entries) => {
        return entries.reduce<t.TypeOf<T> & { metadata: M }>(
          (acc, [p, item]) => {
            if (parseInt(p, 10) <= page) {
              return {
                data: acc.data.concat(item.data),
                totals: item.totals,
                metadata: item.metadata,
              };
            }
            return acc;
          },
          { data: [], totals: {}, metadata: empty }
        );
      }
    );
    stateLogger.debug.log(`[%s] Stored data %O`, cacheKey, storedResponse);
    return storedResponse;
  });
};

const paginatedCachedQuery =
  <M, T extends t.Mixed = t.Mixed>(
    apiRequest: (input: any) => TE.TaskEither<APIError, t.TypeOf<T>>,
    empty: M,
    reduceMetadata: (acc: M & { data: any[] }, e: t.TypeOf<T>) => M
  ) =>
  (cachePrefix: string) =>
  ({
    page = 1,
    hash,
    ...query
  }: {
    page?: number;
    hash?: string;
  }): TE.TaskEither<APIError, t.TypeOf<T> & { metadata: M }> => {
    const perPage = 20;

    const cacheKey = toKey(cachePrefix, hash);
    if (!infiniteListCache[cacheKey]) {
      infiniteListCache[cacheKey] = {};
    }

    return pipe(
      getFromCache<T, M>(cacheKey, page),
      TE.chain((result) => {
        if (result !== undefined) {
          return buildFromCache(cacheKey, page, empty);
        }

        return pipe(
          apiRequest({
            Query: {
              _start: (page - 1) * perPage,
              _end: perPage,
              ...(query as any),
            },
          }),
          TE.mapLeft((e) => {
            stateLogger.debug.log(`API Error %O`, e.details);
            return e;
          }),
          TE.map((apiResponse) => {
            stateLogger.debug.log(
              "[%s] API response %O",
              cacheKey,
              apiResponse
            );

            const storedResponse = pipe(
              infiniteListCache[cacheKey] ?? {},
              Object.entries,
              (entries) => {
                return entries.reduce(
                  (acc, [p, item]) => acc.concat(item.data),
                  []
                );
              }
            );

            const { data, ...metadata } = [
              ...storedResponse,
              ...apiResponse.data,
            ].reduce(reduceMetadata, { data: [], ...empty });

            const response = {
              totals: apiResponse.totals,
              data,
              metadata,
            };

            infiniteListCache[cacheKey][page] = {
              ...apiResponse,
              metadata: response.metadata,
            };

            stateLogger.debug.log("[%s] Response %O", cacheKey, response);

            return response;
          })
        );
      })
    );
  };

const reduceEvent = (
  acc: InfiniteEventListMetadata,
  e: Events.EventV2
): InfiniteEventListMetadata => {
  if (e.type === "ScientificStudy") {
    return {
      ...acc,
      groups: acc.groups.includes(e.payload.publisher)
        ? acc.groups
        : acc.groups.concat(e.payload.publisher),
    };
  }
  if (e.type === "Death") {
    return {
      ...acc,
      actors: acc.actors.includes(e.payload.victim)
        ? acc.actors
        : acc.actors.concat(e.payload.victim),
    };
  }

  return {
    actors: acc.actors
      .filter((a) => !(e.payload.actors ?? []).includes(a))
      .concat(e.payload.actors),
    groups: acc.groups
      .filter((a) => !(e.payload.groups ?? []).includes(a))
      .concat(e.payload.groups),
    keywords: acc.keywords
      .filter((a) => !(e.payload.keywords ?? []).includes(a))
      .concat(e.payload.keywords),
    groupsMembers: acc.groupsMembers
      .filter((a) => !(e.payload.groupsMembers ?? []).includes(a))
      .concat(e.payload.groupsMembers),
    media: acc.media
      .filter((a) => !(e.payload.media ?? []).includes(a))
      .concat(e.payload.media),
  };
};

const makeEventListQuery = paginatedCachedQuery<InfiniteEventListMetadata>(
  api.Event.Custom.SearchV2,
  { actors: [], groups: [], groupsMembers: [], keywords: [], media: [] },
  ({ data, ...acc }, e) => {
    return {
      data: data.concat(e),
      ...reduceEvent(acc, e),
    };
  }
);

interface InfiniteEventListResult {
  data: Events.EventV2[];
  totals: {
    events: number;
    deaths: number;
    scientificStudies: number;
  };
  metadata: InfiniteEventListMetadata;
}

export const eventsPaginated = queryStrict<
  InfiniteEventListParams,
  APIError,
  InfiniteEventListResult
>(makeEventListQuery(IL_EVENT_KEY_PREFIX), refetch);

export const eventNetworkList = queryStrict<
  InfiniteEventListParams,
  APIError,
  { data: Events.Event[]; total: number; metadata: InfiniteEventListMetadata }
>(makeEventListQuery(IL_NETWORK_KEY_PREFIX), refetch);

interface InfiniteDeathListMetadata {
  victims: string[];
}

export const deathsPaginated = queryStrict<
  InfiniteDeathsListParam,
  APIError,
  {
    data: Events.Death.Death[];
    total: number;
    metadata: InfiniteDeathListMetadata;
  }
>(
  paginatedCachedQuery(
    api.DeathEvent.List,
    {
      victims: [] as string[],
    },
    (acc, d: Events.Death.Death) => {
      return {
        data: acc.data.concat(d),
        victims: acc.victims
          .filter((a: string) => d.victim !== a)
          .concat(d.victim),
      };
    }
  )(IL_DEATH_KEY_PREFIX),
  refetch
);

/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Events } from "@econnessione/shared/io/http";
import { APIError } from "@econnessione/shared/providers/api.provider";
import { Actor } from "@io/http/Actor";
import { Death } from "@io/http/Events/Death";
import { available, queryStrict } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { api } from "../api";
import { EventsView } from "../utils/location.utils";
import { stateLogger } from "../utils/logger.utils";
import { toKey } from "utils/state.utils";

export const IL_EVENT_KEY_PREFIX = "events";
export const IL_DEATH_KEY_PREFIX = "deaths";
export const IL_NETWORK_KEY_PREFIX = "network";
export const IL_ACTORS_KEY_PREFIX = "actors";

export type InfiniteEventListParams = Omit<EventsView, "view">;
export interface InfiniteDeathsListParam {
  page: number;
  hash?: string;
}

export interface InfiniteEventListMetadata {
  actors: string[];
  groups: string[];
  keywords: string[];
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
                total: item.total,
                metadata: item.metadata,
              };
            }
            return acc;
          },
          { data: [], total: 0, metadata: empty }
        );
      }
    );
    stateLogger.debug.log(`[%s] Stored data %O`, cacheKey, storedResponse);
    return storedResponse;
  });
};

const eventsQueryWithCache =
  <T extends t.Mixed, M>(
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
          TE.map((prevRes) => {
            stateLogger.debug.log("[%s] API response %O", cacheKey, prevRes);

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
              ...prevRes.data,
            ].reduce(reduceMetadata, { data: [], ...empty });

            const response = {
              total: prevRes.total,
              data,
              metadata,
            };

            infiniteListCache[cacheKey][page] = {
              ...prevRes,
              metadata: response.metadata,
            };

            stateLogger.debug.log("[%s] Response %O", cacheKey, response);

            return response;
          })
        );
      })
    );
  };

const makeEventListQuery = eventsQueryWithCache(
  api.Event.List,
  { actors: [], groups: [], groupsMembers: [], keywords: [] },
  (acc, e) => {
    return {
      data: acc.data.concat(e),
      actors: acc.actors
        .filter((a: string) => !(e.actors ?? []).includes(a))
        .concat(e.actors),
      groups: acc.groups
        .filter((a: string) => !(e.groups ?? []).includes(a))
        .concat(e.groups),
      keywords: acc.keywords
        .filter((a: string) => !(e.keywords ?? []).includes(a))
        .concat(e.keywords),
      groupsMembers: acc.groupsMembers
        .filter((a: string) => !(e.groupsMembers ?? []).includes(a))
        .concat(e.groupsMembers),
    };
  }
);

interface InfiniteEventListResult {
  data: Events.Event[];
  total: number;
  metadata: InfiniteEventListMetadata;
}

export const infiniteEventList = queryStrict<
  InfiniteEventListParams,
  APIError,
  InfiniteEventListResult
>(makeEventListQuery(IL_EVENT_KEY_PREFIX), available);

export const eventNetworkList = queryStrict<
  InfiniteEventListParams,
  APIError,
  { data: Events.Event[]; total: number; metadata: InfiniteEventListMetadata }
>(makeEventListQuery(IL_NETWORK_KEY_PREFIX), available);

interface InfiniteDeathListMetadata {
  victims: string[];
}

export const deathsInfiniteList = queryStrict<
  InfiniteDeathsListParam,
  APIError,
  { data: Death[]; total: number; metadata: InfiniteDeathListMetadata }
>(
  eventsQueryWithCache(
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
  available
);

export const actorsInfiniteList = queryStrict<
  { ids?: string[]; fullName?: string; page?: number; hash?: string },
  APIError,
  { data: Actor[]; total: number; metadata: {} }
>(
  eventsQueryWithCache(api.Actor.List, {}, (acc, d: Actor) => {
    return {
      data: acc.data.concat(d),
    };
  })(IL_ACTORS_KEY_PREFIX),
  available
);

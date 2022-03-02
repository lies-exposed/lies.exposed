/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Events } from "@liexp/shared/io/http";
import { GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { APIError } from "@liexp/shared/providers/api.provider";
import { queryStrict, refetch } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { api } from "../api";
import { EventsView } from "../utils/location.utils";
import { stateLogger } from "../utils/logger.utils";
import {
  buildFromCache,
  getFromCache,
  infiniteListCache,
  toKey,
} from "../utils/state.utils";

export const IL_EVENT_KEY_PREFIX = "events";
export const IL_DEATH_KEY_PREFIX = "deaths";
export const IL_NETWORK_KEY_PREFIX = "network";
export const IL_ACTORS_KEY_PREFIX = "actors";
export const IL_SCIENTIFIC_STUDIES_KEY_PREFIX = "scientific-studies";

export type InfiniteEventListParams = Omit<EventsView, "view">;

export interface InfiniteEventListMetadata {
  actors: UUID[];
  groups: UUID[];
  keywords: UUID[];
  groupsMembers: UUID[];
  media: UUID[];
  links: UUID[];
}

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
  e: Events.Event
): InfiniteEventListMetadata => {
  if (e.type === Events.ScientificStudy.SCIENTIFIC_STUDY.value) {
    return {
      ...acc,
      groups:
        e.payload.publisher === undefined ||
        acc.groups.includes(e.payload.publisher)
          ? acc.groups
          : acc.groups.concat(e.payload.publisher),
    };
  }
  if (e.type === Events.Death.DEATH.value) {
    return {
      ...acc,
      actors: acc.actors.includes(e.payload.victim)
        ? acc.actors
        : acc.actors.concat(e.payload.victim),
    };
  }

  if (e.type === Events.Patent.PATENT.value) {
    return {
      ...acc,
      actors: acc.actors.concat(
        e.payload.owners.actors.filter((a) => !acc.actors.includes(a))
      ),
      groups: acc.groups.concat(
        e.payload.owners.groups.filter((a) => !acc.groups.includes(a))
      ),
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
      .filter((a) => !(e.keywords ?? []).includes(a))
      .concat(e.keywords),
    groupsMembers: acc.groupsMembers
      .filter((a) => !(e.payload.groupsMembers ?? []).includes(a))
      .concat(e.payload.groupsMembers),
    media: acc.media
      .filter((a) => !(e.media ?? []).includes(a))
      .concat(e.media),
    links: acc.links
      .filter((a) => !(e.links ?? []).includes(a))
      .concat(e.links),
  };
};

const makeEventListQuery = paginatedCachedQuery<InfiniteEventListMetadata>(
  api.Event.List,
  {
    actors: [],
    groups: [],
    groupsMembers: [],
    keywords: [],
    media: [],
    links: [],
  },
  ({ data, ...acc }, e) => {
    return {
      data: data.concat(e),
      ...reduceEvent(acc, e),
    };
  }
);

interface InfiniteEventListResult {
  data: Events.Event[];
  totals: {
    uncategorized: number;
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
  any,
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
          .filter((a: string) => d.payload.victim !== a)
          .concat(d.payload.victim),
      };
    }
  )(IL_DEATH_KEY_PREFIX),
  refetch
);

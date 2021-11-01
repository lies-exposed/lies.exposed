/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Endpoints } from "@econnessione/shared/endpoints";
import { Events } from "@econnessione/shared/io/http";
import {
  APIError,
  toAPIError,
} from "@econnessione/shared/providers/api.provider";
import { UUID } from "@io/http/Common";
import { available, queryStrict } from "avenger";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { api } from "../api";
import { EventsView } from "../utils/location.utils";
import { stateLogger } from "../utils/logger.utils";

export type InfiniteEventListParams = Omit<EventsView, "view">;
export interface InfiniteDeathsListParam {
  page: number;
  hash?: string;
}

interface InfiniteEventListMetadata {
  actors: string[];
  groups: string[];
  keywords: string[];
}

const eventsQueryWithCache =
  <T extends t.Mixed, M extends t.Mixed>(
    apiRequest: (input: any) => TE.TaskEither<APIError, t.TypeOf<T>>,
    codec: M,
    empty: t.TypeOf<M>,
    reduceMetadata: (
      acc: t.TypeOf<M> & { data: any[] },
      e: t.TypeOf<T>
    ) => t.TypeOf<M>
  ) =>
  (cachePrefix: string) =>
  ({ page = 1, hash, ...query }: InfiniteEventListParams) => {
    if (hash === undefined) {
      stateLogger.debug.log(
        `No hash given, returning empty response.`,
        hash,
        query,
        page
      );
      return TE.right(empty);
    }

    const cacheKey = `${cachePrefix}${hash}`;

    stateLogger.debug.log(
      `Cached query for hash (%s) for payload %O and page (%d)`,
      cacheKey,
      query,
      page
    );

    const clearOrGetTask: TE.TaskEither<APIError, string | null> =
      page === 1
        ? TE.fromIO<null, APIError>(() => {
            stateLogger.debug.log(`Removing key %s`, cacheKey);
            window.localStorage.removeItem(cacheKey);
            return null;
          })
        : TE.fromIO<string | null, APIError>(() => {
            stateLogger.debug.log(`Get stored data at key %s`, cacheKey);
            return window.localStorage.getItem(cacheKey);
          });

    return pipe(
      clearOrGetTask,
      TE.chain((result) => {
        if (result !== null) {
          const jsonResult = JSON.parse(result);
          stateLogger.debug.log(
            `Local stored data %O for key %s`,
            jsonResult,
            cacheKey
          );
          return pipe(
            jsonResult,
            codec.decode,
            E.mapLeft((e) => {
              // eslint-disable-next-line no-console
              PathReporter.report(E.left(e)).map(console.log);
              return toAPIError(e);
            }),
            TE.fromEither
          );
        }
        return TE.right({ total: 0, data: [], ...empty });
      }),
      TE.chain((storedResponse) => {
        const currentStart = (page - 1) * 20;
        if (storedResponse.data.length > currentStart + 20) {
          return TE.right(storedResponse);
        }
        return pipe(
          apiRequest({
            Query: { _start: currentStart, _end: 20, ...(query as any) },
          }),
          TE.chain((prevRes) => {
            const { data, ...metadata } = [
              ...storedResponse.data,
              ...prevRes.data,
            ].reduce(reduceMetadata, { data: [], ...empty });
            const response = {
              total: prevRes.total,
              data,
              metadata,
            };
            return pipe(
              TE.fromIO<void, APIError>(() => {
                stateLogger.debug.log(`Set item [%s]: %O`, cacheKey, response);
                return window.localStorage.setItem(
                  cacheKey,
                  JSON.stringify(response)
                );
              }),
              TE.map(() => response)
            );
          })
        );
      })
    );
  };

const makeEventListQuery = eventsQueryWithCache(
  api.Event.List,
  t.strict({
    actors: t.array(t.string),
    groups: t.array(t.string),
    keywords: t.array(t.string),
    groupsMembers: t.array(t.string),
  }),
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
const infiniteEventListCachePrefix = "infinite-list-";

interface InfiniteEventListResult {
  data: Events.Event[];
  total: number;
  metadata: InfiniteEventListMetadata;
}

export const infiniteEventList = queryStrict<
  InfiniteEventListParams,
  APIError,
  InfiniteEventListResult
>(makeEventListQuery(infiniteEventListCachePrefix), available);

const eventNetworkListCachePrefix = "network-";

export const eventNetworkList = queryStrict<
  InfiniteEventListParams,
  APIError,
  { data: Events.Event[]; total: number; metadata: InfiniteEventListMetadata }
>(makeEventListQuery(eventNetworkListCachePrefix), available);

export const deathsInfiniteList = queryStrict<
  InfiniteDeathsListParam,
  APIError,
  t.TypeOf<Endpoints["DeathEvent"]["List"]["Output"]>
>(
  eventsQueryWithCache(
    api.DeathEvent.List,
    t.strict({
      victims: t.array(UUID),
    }),
    {
      victims: [],
    },
    (acc, d: Events.Death.Death) => {
      return {
        data: acc.data.concat(d),
        victims: acc.victims
          .filter((a: string) => d.victim !== a)
          .concat(d.victim),
      };
    }
  )("deaths-"),
  available
);

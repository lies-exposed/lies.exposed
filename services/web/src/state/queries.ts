/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Events } from "@econnessione/shared/io/http";
import {
  APIError,
  toAPIError,
} from "@econnessione/shared/providers/api.provider";
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

interface InfiniteEventListMetadata {
  actors: string[];
  groups: string[];
  keywords: string[];
}

const eventsQueryWithCache =
  (cachePrefix: string) =>
  ({ page = 1, hash, ...query }: InfiniteEventListParams) => {
    if (hash === undefined) {
      stateLogger.debug.log(
        `No hash given, returning empty response.`,
        hash,
        query,
        page
      );
      return TE.right({
        data: [],
        total: 0,
        metadata: {
          actors: [],
          groups: [],
          groupsMembers: [],
          keywords: [],
        },
      });
    }

    const cacheKey = `${cachePrefix}${hash}`;

    stateLogger.debug.log(
      `Infinite event list with hash (%s) for payload %O and page (%d)`,
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
            t.strict({
              data: t.array(Events.Event),
              total: t.number,
              metadata: t.strict({
                actors: t.array(t.string),
                groups: t.array(t.string),
              }),
            }).decode,
            E.mapLeft((e) => {
              // eslint-disable-next-line no-console
              PathReporter.report(E.left(e)).map(console.log);
              return toAPIError(e);
            }),
            TE.fromEither
          );
        }
        return TE.right({
          data: [] as any,
          total: 0,
          metadata: {
            actors: [],
            groups: [],
          },
        });
      }),
      TE.chain((storedResponse) => {
        const currentStart = (page - 1) * 20;
        if (storedResponse.data.length > currentStart + 20) {
          return TE.right(storedResponse);
        }
        return pipe(
          api.Event.List({
            Query: { _start: currentStart, _end: 20, ...(query as any) },
          }),
          TE.chain((prevRes) => {
            const { events, ...metadata } = [
              ...storedResponse.data,
              ...prevRes.data,
            ].reduce(
              (acc, e) => {
                return {
                  events: acc.events.concat(e),
                  actors: acc.actors
                    .filter((a: string) => !e.actors.includes(a))
                    .concat(e.actors),
                  groups: acc.groups
                    .filter((a: string) => !e.groups.includes(a))
                    .concat(e.groups),
                  keywords: acc.keywords
                    .filter((a: string) => !e.keywords.includes(a))
                    .concat(e.keywords),
                };
              },
              {
                events: [] as any,
                actors: [] as string[],
                groups: [] as string[],
                keywords: [] as string[],
              }
            );
            const response = {
              total: prevRes.total,
              data: events,
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

const infiniteEventListCachePrefix = "infinite-list-";

export const infiniteEventList = queryStrict<
  InfiniteEventListParams,
  APIError,
  { data: Events.Event[]; total: number; metadata: InfiniteEventListMetadata }
>(eventsQueryWithCache(infiniteEventListCachePrefix), available);

const eventNetworkListCachePrefix = "network-";

export const eventNetworkList = queryStrict<
  InfiniteEventListParams,
  APIError,
  { data: Events.Event[]; total: number; metadata: InfiniteEventListMetadata }
>(eventsQueryWithCache(eventNetworkListCachePrefix), available);

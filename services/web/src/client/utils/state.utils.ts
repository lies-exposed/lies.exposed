import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type * as t from "io-ts";
import { webLogger } from "./logger.utils.js";

const stateLogger = webLogger.extend("state");

export const toKey = (cachePrefix: string, hash?: string): string => {
  // return pipe(
  //   q as any,
  //   R.reduceWithIndex(S.Ord)({} as any, (key, acc, b) => ({
  //     ...acc,
  //     [key]: b,
  //   })),
  //   JSON.stringify
  // );

  const cacheKey = hash ? `${cachePrefix}-${hash}` : cachePrefix;
  return cacheKey;
};

export const infiniteListCache: Record<string, Record<number, any>> = {};

export const getFromCache = <T extends t.Any, M>(
  cacheKey: string,
  p: number,
): TE.TaskEither<APIError, (t.TypeOf<T> & { metadata: M }) | undefined> =>
  TE.fromIO<(t.TypeOf<T> & { metadata: M }) | undefined, APIError>(() => {
    const cache = infiniteListCache[cacheKey]?.[p];
    stateLogger.debug.log(`[%s] Cache for page %d %O`, cacheKey, p, cache);
    return cache;
  });

export const buildFromCache = <T extends t.Any, M>(
  cacheKey: string,
  page: number,
  empty: M,
): TE.TaskEither<APIError, t.TypeOf<T> & { metadata: M }> => {
  return TE.fromIO<t.TypeOf<T> & { metadata: M }, APIError>(() => {
    stateLogger.debug.log(
      "[%s] Build data from cache until page %d",
      cacheKey,
      page,
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
          { data: [], totals: {}, metadata: empty },
        );
      },
    );
    stateLogger.debug.log(`[%s] Stored data %O`, cacheKey, storedResponse);
    return storedResponse;
  });
};

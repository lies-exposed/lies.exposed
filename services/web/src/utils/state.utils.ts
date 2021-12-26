import { SearchEventsQuery } from "@econnessione/shared/io/http/Events/SearchEventsQuery";

type Query = Omit<SearchEventsQuery, "_start" | "_end">;

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

import { GetEventsQueryFilter } from "@econnessione/shared/io/http/Events/Uncategorized";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";

type Query = Omit<GetEventsQueryFilter, "_start" | "_end">;

export const toKey = (q: Query): string => {
  return pipe(
    q as any,
    R.reduceWithIndex(S.Ord)({} as any, (key, acc, b) => ({
      ...acc,
      [key]: b,
    })),
    JSON.stringify
  );
};

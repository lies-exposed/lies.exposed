/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { Events } from "@econnessione/shared/io/http";
import { GetEventsQueryFilter } from "@econnessione/shared/io/http/Events/Uncategorized";
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
import { toKey } from "../utils/state.utils";

export const infiniteEventList = queryStrict<
  GetEventsQueryFilter,
  APIError,
  { data: Events.Event[]; total: number }
>(({ _start, _end, ...query }: GetEventsQueryFilter) => {
  const key = toKey(query);

  const resetTask =
    (_start as any) === 0
      ? TE.fromIO<void, APIError>(() => window.localStorage.removeItem(key))
      : TE.right(undefined);

  return pipe(
    resetTask,
    TE.chain(() => api.Event.List({ Query: { _start, _end, ...query } })),
    TE.chain((events) =>
      pipe(
        TE.fromIO<string | null, APIError>(() =>
          window.localStorage.getItem(key)
        ),
        TE.chain((result) => {
          if (result !== null) {
            return pipe(
              JSON.parse(result),
              t.strict({ data: t.array(Events.Event), total: t.number }).decode,
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
          });
        }),
        TE.chain((prevRes) => {
          const response = {
            total: events.total,
            data: [...prevRes.data, ...events.data],
          };
          return pipe(
            TE.fromIO<void, APIError>(() =>
              window.localStorage.setItem(key, JSON.stringify(response))
            ),
            TE.map(() => response)
          );
        })
      )
    )
  );
}, available);

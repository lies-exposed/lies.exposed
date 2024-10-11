import { type FSError } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type TEReader } from "../flow.types.js";
import { olderThan } from "./olderThan.flow.js";

export const getOlderThanOr =
  (fileName: string, hours?: number) =>
  <A>(rte: TEReader<A>): TEReader<A> => {
    return pipe(
      olderThan(fileName, hours ?? 24),
      fp.RTE.chain((older) => (ctx) => {
        if (older === "valid") {
          return pipe(ctx.fs.getObject(fileName), fp.TE.map(JSON.parse));
        }
        return pipe(
          rte,
          fp.RTE.mapLeft((e) => e as FSError),
          fp.RTE.chainFirstTaskEitherKW((body) =>
            ctx.fs.writeObject(fileName, JSON.stringify(body)),
          ),
        )(ctx);
      }),
    );
  };

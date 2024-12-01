import { fp } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { olderThan } from "./olderThan.flow.js";

export const getOlderThanOr =
  (fileName: string, hours?: number) =>
  <A, E, C extends FSClientContext & LoggerContext>(
    rte: ReaderTaskEither<C, E, A>,
  ): ReaderTaskEither<C, E, A> => {
    return pipe(
      olderThan(fileName, hours ?? 24),
      fp.RTE.mapLeft((e) => e as E),
      fp.RTE.chain((older) => (ctx): TaskEither<E, A> => {
        if (older === "valid") {
          return pipe(
            ctx.fs.getObject(fileName),
            fp.TE.map(JSON.parse),
            fp.TE.mapLeft((e) => e as E),
          );
        }

        return pipe(
          rte,
          fp.RTE.mapLeft((e) => e),
          fp.RTE.chainFirstTaskEitherKW((body) =>
            ctx.fs.writeObject(fileName, JSON.stringify(body)),
          ),
          fp.RTE.mapLeft((e) => e as E),
        )(ctx);
      }),
    );
  };

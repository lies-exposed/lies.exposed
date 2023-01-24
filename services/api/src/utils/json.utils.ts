import * as fs from "fs";
import { type Logger } from "@liexp/core/logger";
import * as E from "fp-ts/Either";
import * as IOE from "fp-ts/IOEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";

export const GetWriteJSON =
  (log: Logger) =>
  (outputPath: string) =>
  (results: any): TE.TaskEither<Error, void> => {
    return TE.fromIOEither(
      IOE.tryCatch(() => {
        log.debug.log(`Writing data at %s`, outputPath);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        log.debug.log(`Data written!`);
      }, E.toError)
    );
  };

export const GetReadJSON =
  (log: Logger) =>
  <A, O = A, I = unknown>(
    readPath: string,
    decoder: t.Type<A, O, I>
  ): TE.TaskEither<Error, A> => {
    return pipe(
      TE.fromIOEither(
        IOE.tryCatch(() => {
          log.debug.log(`Reading data from %s`, readPath);
          return fs.readFileSync(readPath, "utf-8");
        }, E.toError)
      ),
      TE.chainEitherK((string) => {
        return pipe(
          E.parseJSON(string, E.toError),
          E.chain((json) =>
            pipe(
              decoder.decode(json as any),
              E.mapLeft((e) => {
                // eslint-disable-next-line no-console
                console.error(PathReporter.report(E.left(e)));
                return new Error();
              })
            )
          )
        );
      })
    );
  };

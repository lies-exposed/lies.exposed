import * as fs from "fs";
import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { TaskEither } from 'fp-ts/TaskEither';
import type * as t from "io-ts";
import { PathReporter } from "io-ts/PathReporter";

export const GetWriteJSON =
  (log: Logger) =>
  (outputPath: string) =>
  (results: any): TaskEither<Error, void> => {
    return fp.TE.fromIOEither(
      fp.IOE.tryCatch(() => {
        log.debug.log(`Writing data at %s`, outputPath);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        log.debug.log(`Data written!`);
      }, fp.E.toError),
    );
  };

export const GetReadJSON =
  (log: Logger) =>
  <A, O = A, I = unknown>(
    readPath: string,
    decoder: t.Type<A, O, I>,
  ): TaskEither<Error, A> => {
    return pipe(
      fp.TE.fromIOEither(
        fp.IOE.tryCatch(() => {
          log.debug.log(`Reading data from %s`, readPath);
          return fs.readFileSync(readPath, "utf-8");
        }, fp.E.toError),
      ),
      fp.TE.chainEitherK((string) => {
        return pipe(
          fp.Json.parse(string),
          fp.E.mapLeft(e => e instanceof Error ? e : new Error()),
          fp.E.chain((json) =>
            pipe(
              decoder.decode(json as I),
              fp.E.mapLeft((e) => {
                // eslint-disable-next-line no-console
                console.error(PathReporter.report(fp.E.left(e)));
                return new Error();
              }),
            ),
          ),
        );
      }),
    );
  };

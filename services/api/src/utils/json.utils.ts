import * as fs from "fs";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as Json from "fp-ts/lib/Json.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { toControllerError } from "#io/ControllerError.js";

export const GetWriteJSON =
  (log: Logger) =>
  (outputPath: string) =>
  (results: any): TE.TaskEither<Error, void> => {
    return TE.fromIOEither(
      IOE.tryCatch(() => {
        log.debug.log(`Writing data at %s`, outputPath);
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        log.debug.log(`Data written!`);
      }, E.toError),
    );
  };

export const GetReadJSON =
  (log: Logger) =>
  <A, O = A, I = unknown>(
    readPath: string,
    decoder: t.Type<A, O, I>,
  ): TE.TaskEither<Error, A> => {
    return pipe(
      TE.fromIOEither(
        IOE.tryCatch(() => {
          log.debug.log(`Reading data from %s`, readPath);
          return fs.readFileSync(readPath, "utf-8");
        }, E.toError),
      ),
      TE.chainEitherK((string) => {
        return pipe(
          Json.parse(string),
          E.mapLeft(toControllerError),
          E.chain((json) =>
            pipe(
              decoder.decode(json as I),
              E.mapLeft((e) => {
                // eslint-disable-next-line no-console
                console.error(PathReporter.report(E.left(e)));
                return new Error();
              }),
            ),
          ),
        );
      }),
    );
  };

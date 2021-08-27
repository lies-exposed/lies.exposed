import * as fs from "fs";
import { Logger } from "@econnessione/core/logger";
import * as csv from "fast-csv";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";

export const parseCSV =
  (log: Logger) =>
  <A, O = A, I = unknown>(
    csvPath: string,
    decoder: t.Type<A, O, I>
  ): TE.TaskEither<Error, A[]> => {
    return pipe(
      TE.tryCatch(() => {
        log.debug.log("Importing from source %s", csvPath);
        return new Promise<any[]>((resolve, reject) => {
          const data: any[] = [];
          fs.createReadStream(csvPath)
            .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
            // .validate(decoder.is)
            .on("error", (e) => reject(e))
            .on("data", (d) => {
              data.push(d);
            })
            .on("end", () => {
              log.debug.log("Done importing %d lines from %s", data.length, csvPath);
              resolve(data);
            });
        });
      }, E.toError),
      TE.mapLeft(() => []),
      TE.chainEitherK((results) => {
        const r = pipe(
          results,
          A.map((r) => decoder.decode(r)),
          A.sequence(E.either)
        );

        return r;
      }),
      TE.mapLeft((errs) => {
        // eslint-disable-next-line
        console.log(PathReporter.report(E.left(errs)));
        return new Error();
      })
    );
  };

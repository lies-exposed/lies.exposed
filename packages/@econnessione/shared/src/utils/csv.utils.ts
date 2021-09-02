import { Logger } from "@econnessione/core/logger";
import * as csv from "fast-csv";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";

export interface CSVUtil {
  parseString: <A, O = A, I = unknown>(
    content: string,
    decoder: t.Type<A, O, I>,
    mapper?: (a: I) => A
  ) => TE.TaskEither<Error, A[]>;
  writeToPath: <T>(
    outputPath: string,
    results: T[]
  ) => TE.TaskEither<Error, void>;
}

interface CSVUtilOptions {
  log: Logger;
}

export const GetCSVUtil = (opts: CSVUtilOptions): CSVUtil => {
  const parseString = <A, O = A, I = unknown>(
    content: string,
    decoder: t.Type<A, O, I>,
    mapper?: (v: I) => A
  ): TE.TaskEither<Error, A[]> => {
    return pipe(
      TE.tryCatch(() => {
        return new Promise<any[]>((resolve, reject) => {
          const data: A[] = [];
          csv
            .parseString(content, { headers: true, ignoreEmpty: true })
            // .validate(decoder.is)
            .on("error", (e) => {
              reject(e);
            })
            .on("data", (d) => {
              data.push(d);
            })
            .on("end", () => {
              resolve(data);
            });
        });
      }, E.toError),
      TE.mapLeft((e) => []),
      TE.chainEitherK((results) => {
        const r = pipe(
          results,
          A.map((v) => decoder.decode(mapper ? mapper(v) : v)),
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

  const writeToPath = <T>(
    outputPath: string,
    results: T[]
  ): TE.TaskEither<Error, void> => {
    return TE.tryCatch(async () => {
      opts.log.debug.log(
        "Write results (%d) in %s",
        results.length,
        outputPath
      );
      csv
        .writeToPath(outputPath, results, {
          headers: Object.keys(results[0]),
          writeHeaders: true,
        })
        // eslint-disable-next-line
        .on("error", (err) => Promise.reject(err))
        .on("finish", () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          Promise.resolve();
        });
    }, E.toError);
  };

  return {
    parseString,
    writeToPath,
  };
};

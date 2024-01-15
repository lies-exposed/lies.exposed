import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as csv from "fast-csv";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";

interface ParseFileOpts<A, O = A, I = unknown> {
  mapper?: (a: I) => A;
  decoder: t.Type<A, O, I>;
}

export interface CSVUtil {
  parseString: <A, O = A, I = unknown>(
    content: string,
    decoder: t.Type<A, O, I>,
    mapper?: (a: I) => A,
  ) => TE.TaskEither<Error, A[]>;
  parseFile: <A, O = A, I = unknown>(
    location: string,
    parseOptions: csv.ParserOptionsArgs,
    opts: ParseFileOpts<A, O, I>,
  ) => TE.TaskEither<Error, A[]>;
  writeToPath: <T extends csv.FormatterRow>(
    outputPath: string,
    results: T[],
  ) => TE.TaskEither<Error, void>;
}

interface CSVUtilOptions {
  log: Logger;
}

export const GetCSVUtil = ({ log }: CSVUtilOptions): CSVUtil => {
  const parseFile = <A, O = A, I = unknown>(
    location: string,
    parseOptions: csv.ParserOptionsArgs,
    opts: ParseFileOpts<A, O, I>,
  ): TE.TaskEither<Error, A[]> => {
    const data: A[] = [];
    return TE.tryCatch(() => {
      return new Promise((resolve, reject) => {
        // log.debug.log("Reading file %s with options %O", location, parseOptions);
        csv
          .parseFile(location, parseOptions)
          .on("data", (item) => {
            const decoded = opts.decoder.decode(
              opts.mapper ? opts.mapper(item) : item,
            );

            if (E.isLeft(decoded)) {
              log.debug.log("Decode failed %O", PathReporter.report(decoded));
              reject(decoded.left);
              return;
            }

            data.push(decoded.right);
          })
          .on("end", () => {
            resolve(data);
          })
          .on("error", reject);
      });
    }, E.toError);
  };

  const parseString = <A, O = A, I = unknown>(
    content: string,
    decoder: t.Type<A, O, I>,
    mapper?: (v: I) => A,
  ): TE.TaskEither<Error, A[]> => {
    return pipe(
      TE.tryCatch(() => {
        return new Promise<any[]>((resolve, reject) => {
          const data: A[] = [];
          csv
            .parseString(content, { headers: true, ignoreEmpty: true })
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
          A.sequence(E.Applicative),
        );

        return r as E.Either<t.ValidationError[], any>;
      }),
      TE.mapLeft((errs) => {
        // eslint-disable-next-line
        console.log(PathReporter.report(E.left(errs)));
        return new Error();
      }),
    );
  };

  const writeToPath = <T extends csv.FormatterRow>(
    outputPath: string,
    results: T[],
  ): TE.TaskEither<Error, void> => {
    return TE.tryCatch(async () => {
      log.debug.log("Write results (%d) in %s", results.length, outputPath);
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
    parseFile,
    writeToPath,
  };
};

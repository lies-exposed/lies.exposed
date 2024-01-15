import { fp } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

export const traverseArrayOfE = <A, E, B>(
  results: A[],
  fn: (a: A) => E.Either<E, B>,
): E.Either<E, B[]> => pipe(results, A.traverse(E.Applicative)(fn));

interface ReqInput<D> {
  skip: number;
  amount: number;
  results: D[];
}

export const walkPaginatedRequest =
  ({ logger }: { logger: Logger }) =>
  <A, E, D>(
    apiReqFn: (i: ReqInput<D>) => TE.TaskEither<E, A>,
    getTotal: (r: A) => number,
    getData: (r: A) => D[],
    skip: number,
    amount: number,
  ): TE.TaskEither<E, D[]> => {
    const result: D[] = [];

    const loop = (
      skip: number,
      amount: number,
      results: D[],
    ): TE.TaskEither<E, D[]> => {
      logger.debug.log("Walking paginated requests: %d => %d", skip, amount);

      return pipe(
        apiReqFn({ skip, amount, results }),
        fp.TE.mapLeft((e) => ({
          ...e,
          message: `Failed with skip(${skip}) and amount(${amount}): ${JSON.stringify(
            e,
          )}`,
        })),
        fp.TE.chain((r) => {
          // logger.debug('Response: %o', r);
          const total = getTotal(r);
          const data = getData(r);
          logger.debug.log("Total %d, results size %d", total, data.length);

          if (amount < total) {
            return loop(skip + amount, amount + amount, results.concat(data));
          }
          logger.debug.log(
            "All elements collected, returning... %d",
            data.length,
          );
          return fp.TE.right(results.concat(data));
        }),
      );
    };

    return loop(skip, amount, result);
  };

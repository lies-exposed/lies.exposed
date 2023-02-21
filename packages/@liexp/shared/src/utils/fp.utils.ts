import { fp } from "@liexp/core/fp";
import { type Logger } from "@liexp/core/logger";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import type * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";

export const traverseArrayOfE = <A, E, B>(
  results: A[],
  fn: (a: A) => E.Either<E, B>
): E.Either<E, B[]> => pipe(results, A.traverse(E.Applicative)(fn));

interface ReqInput { skip: number; amount: number }

export const walkPaginatedRequest =
  ({ logger }: { logger: Logger }) =>
  <A, E, D>(
    apiReqFn: (i: ReqInput) => TE.TaskEither<E, A>,
    getTotal: (r: A) => number,
    getData: (r: A) => D[],
    skip: number,
    amount: number
  ): TE.TaskEither<E, D[]> => {
    const result: D[] = [];

    const loop = (
      skip: number,
      amount: number,
      result: D[]
    ): TE.TaskEither<E, D[]> => {
      logger.debug.log("Walking paginated requests: %d => %d", skip, amount);

      return pipe(
        apiReqFn({ skip, amount }),
        fp.TE.mapLeft((e) => ({
          ...e,
          message: `Failed with skip(${skip}) and amount(${amount}): ${JSON.stringify(
            e
          )}`,
        })),
        fp.TE.chain((r) => {
          // logger.debug('Response: %o', r);
          const total = getTotal(r);
          const data = getData(r);
          logger.debug.log("Total %d, results size %d", total, data.length);

          if (amount < total) {
            return loop(skip + amount, amount + amount, result.concat(data));
          }
          logger.debug.log(
            "All elements collected, returning... %d",
            data.length
          );
          return fp.TE.right(result.concat(data));
        })
      );
    };

    return loop(skip, amount, result);
  };

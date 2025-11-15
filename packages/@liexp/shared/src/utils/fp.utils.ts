import { fp } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

export const traverseArrayOfE = <A, E, B>(
  results: readonly A[],
  fn: (a: A) => E.Either<E, B>,
): E.Either<E, readonly B[]> => pipe(results, fp.A.traverse(E.Applicative)(fn));

export const throwTE = async <E, A>(te: TE.TaskEither<E, A>): Promise<A> => {
  return te().then((rr) => {
    if (rr._tag === "Left") {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(rr.left);
    }
    return Promise.resolve(rr.right);
  });
};

export const throwRTE =
  <C, E, A>(rte: ReaderTaskEither<C, E, A>) =>
  async (ctx: C): Promise<A> => {
    return pipe(rte(ctx), throwTE);
  };

interface ReqInput<D> {
  skip: number;
  amount: number;
  results: readonly D[];
}

export const walkPaginatedRequest =
  <A, E, D>(
    apiReqFn: (i: ReqInput<D>) => TE.TaskEither<E, A>,
    getTotal: (r: A) => number,
    getData: (r: A) => TE.TaskEither<E, readonly D[]>,
    skip: number,
    amount: number,
  ) =>
  ({ logger }: { logger: Logger }): TE.TaskEither<E, readonly D[]> => {
    const result: D[] = [];

    const loop = (
      skip: number,
      amount: number,
      results: D[],
    ): TE.TaskEither<E, D[]> => {
      logger.debug.log("Walking paginated requests: %d => %d", skip, amount);

      return pipe(
        apiReqFn({ skip, amount, results }),
        fp.TE.chain((r) => {
          return pipe(
            getData(r),
            fp.TE.map((data) => ({
              total: getTotal(r),
              data,
            })),
          );
        }),
        fp.TE.chain(({ total, data }) => {
          // logger.debug('Response: %o', r);
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

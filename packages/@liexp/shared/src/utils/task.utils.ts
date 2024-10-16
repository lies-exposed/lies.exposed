import { fp } from "@liexp/core/lib/fp/index.js";
import * as T from "fp-ts/lib/Task.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

export const throwTE = async <E, A>(te: TE.TaskEither<E, A>): Promise<A> => {
  return te().then((rr) => {
    if (rr._tag === "Left") {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject(rr.left);
    }
    return Promise.resolve(rr.right);
  });
};

/**
 *
 * @param tasks
 * @returns
 */
export const separateTE = <E, A>(
  tasks: TE.TaskEither<E, A>[],
): T.Task<{ left: E[]; right: A[] }> => {
  return pipe(
    tasks,
    fp.A.traverse(T.ApplicativeSeq)((te) =>
      pipe(
        te,
        fp.TE.fold(
          (e) => fp.T.of(fp.E.left(e)),
          (a) => fp.T.of(fp.E.right(a)),
        ),
      ),
    ),
    fp.T.map(fp.A.separate),
  );
};

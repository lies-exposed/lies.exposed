import { fp } from "@liexp/core/lib/fp/index.js";
import * as T from "fp-ts/lib/Task.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { throwTE } from "./fp.utils.js";

// TODO: remove in favor of the throwTE exported by fp.utils.ts
export { throwTE };

/**
 *
 * @param tasks
 * @returns
 */
export const separateTE = <E, A>(
  tasks: readonly TE.TaskEither<E, A>[],
): T.Task<{ left: readonly E[]; right: readonly A[] }> => {
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

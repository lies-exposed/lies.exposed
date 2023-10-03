import { type Stream, type Writable } from "stream";
import { fp } from "@liexp/core/lib/fp";
import * as T from "fp-ts/Task";
import type * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

export const throwTE = async <E, A>(te: TE.TaskEither<E, A>): Promise<A> => {
  return await te().then((rr) => {
    if (rr._tag === "Left") {
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
  tasks: Array<TE.TaskEither<E, A>>,
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

export const taskifyStream = (
  stream: Stream,
  to: Writable,
): TE.TaskEither<Error, void> => {
  return fp.TE.tryCatch(() => {
    stream.pipe(to);

    return new Promise((resolve, reject) => {
      to.on("error", reject);

      to.on("finish", () => {
        resolve();
      });

      resolve();
    });
  }, fp.E.toError);
};
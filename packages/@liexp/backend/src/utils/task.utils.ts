import { type Readable, type Writable } from "stream";
import { fp } from "@liexp/core/lib/fp/index.js";
import type * as TE from "fp-ts/lib/TaskEither.js";


export const taskifyStream = (
  from: Readable,
  to: Writable
): TE.TaskEither<Error, void> => {
  return fp.TE.tryCatch(() => {
    const p = new Promise<void>((resolve, reject) => {
      to.on("error", reject);

      to.on("finish", () => {
        resolve();
      });
    });

    from.pipe(to);

    return p;
  }, fp.E.toError);
};

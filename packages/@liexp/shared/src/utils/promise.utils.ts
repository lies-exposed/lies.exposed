import * as TE from "fp-ts/lib/TaskEither.js";

export const sleep = (amount: number): TE.TaskEither<Error, void> => {
  return TE.fromTask(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, amount);
      }),
  );
};

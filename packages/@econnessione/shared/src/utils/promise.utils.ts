import * as TE from "fp-ts/lib/TaskEither";

export const sleep = (amount: number): TE.TaskEither<Error, void> => {
  return TE.fromTask(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          void resolve();
        }, amount);
      })
  );
};

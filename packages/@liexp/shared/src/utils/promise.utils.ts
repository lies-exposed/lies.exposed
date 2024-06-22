import * as TE from "fp-ts/TaskEither";

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

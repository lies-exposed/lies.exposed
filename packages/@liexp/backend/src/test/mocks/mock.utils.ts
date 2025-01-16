import { fp } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither";
import { type MockInstance } from "vitest";
import { type DeepMockProxy } from "vitest-mock-extended";

export const mockTERightOnce = <E, U>(
  fn: MockInstance<(...args: any[]) => TaskEither<E, U>>,
  value: (...args: any[]) => U,
) =>
  fn.mockImplementationOnce((...args) => {
    return fp.TE.right(value(...args));
  });

type MockedContext<C extends Record<string, any>> = {
  [K in keyof C]: DeepMockProxy<C[K]>;
};

export const mockedContext = <C extends Record<string, any>>(
  ctx: C,
): MockedContext<C> => ctx;

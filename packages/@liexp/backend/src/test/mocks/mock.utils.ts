import { fp } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type MockInstance } from "vitest";

export const mockTERightOnce = <E, U>(
  fn: MockInstance<(...args: any[]) => TaskEither<E, U>>,
  value: (...args: any[]) => U,
) =>
  fn.mockImplementationOnce((...args) => {
    return fp.TE.right(value(...args));
  });

export const mockRTERightOnce = <C, E, U>(
  fn: MockInstance<(...args: any[]) => ReaderTaskEither<C, E, U>>,
  value: (...args: any[]) => U,
) =>
  fn.mockImplementationOnce((...args) => {
    return fp.RTE.right(value(...args));
  });

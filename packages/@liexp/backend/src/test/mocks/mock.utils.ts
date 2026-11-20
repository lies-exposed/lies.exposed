import { fp } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type MockInstance } from "vitest";

export const mockTERightOnce = <E, U>(
  fn: MockInstance<(...args: unknown[]) => TaskEither<E, U>>,
  value: (...args: unknown[]) => U,
) =>
  fn.mockImplementationOnce((...args) => {
    return fp.TE.right(value(...args));
  });

export const mockTERight = <E, U>(
  fn: MockInstance<(...args: unknown[]) => TaskEither<E, U>>,
  value: (...args: unknown[]) => U,
) =>
  fn.mockImplementation((...args) => {
    return fp.TE.right(value(...args));
  });

export const mockRTERightOnce = <C, E, U>(
  fn: MockInstance<(...args: unknown[]) => ReaderTaskEither<C, E, U>>,
  value: (...args: unknown[]) => U,
) =>
  fn.mockImplementationOnce((...args) => {
    return fp.RTE.right(value(...args));
  });

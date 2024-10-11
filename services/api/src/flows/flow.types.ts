import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

/**
 * Flow is a curried function of {@link RouteContext} that returns
 * synchronous result
 */
export type Flow<Args extends any[], R, Context = RouteContext> = (
  ...args: Args
) => (ctx: Context) => R;

// export type TEFlow2<R> = (
//   ctx: RouteContext,
// ) => TE.TaskEither<ControllerError, R>;

export type TEReader<R, Context = RouteContext> = ReaderTaskEither<
  Context,
  ControllerError,
  R
>;

/**
 * TEFlow is a curried function of {@link RouteContext} that returns
 * a TaskEither
 *
 */
export type TEFlow<Args extends any[], R, Context = RouteContext> = (
  ...args: Args
) => (ctx: Context) => TE.TaskEither<ControllerError, R>;

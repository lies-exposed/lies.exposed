import type * as TE from "fp-ts/TaskEither";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

/**
 * Flow is a curried function of {@link RouteContext} that returns
 * synchronous result
 */
export type Flow<Args extends any[], R> = (
  ctx: RouteContext,
) => (...args: Args) => R;

/**
 * TEFlow is a curried function of {@link RouteContext} that returns
 * a TaskEither
 *
 */
export type TEFlow<Args extends any[], R> = (
  ctx: RouteContext,
) => (...args: Args) => TE.TaskEither<ControllerError, R>;

export type TEFlow2<R> = (
  ctx: RouteContext,
) => TE.TaskEither<ControllerError, R>;

import type * as TE from "fp-ts/lib/TaskEither";
import { type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export type Flow<Args extends any[], R> = (
  ctx: RouteContext
) => (...args: Args) => R;

export type TEFlow<Args extends any[], R> = (
  ctx: RouteContext
) => (...args: Args) => TE.TaskEither<ControllerError, R>;

import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type ControllerError } from "#io/ControllerError.js";

export type TEControllerError<
  A,
  E extends ControllerError = ControllerError,
> = TaskEither<E, A>;

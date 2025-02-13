import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ServerContext } from "#context/context.type.js";
import { type ControllerError } from "#io/ControllerError.js";

/**
 * Flow is a curried function of {@link ServerContext} that returns
 * synchronous result
 */
export type Flow<Args extends any[], R, Context = ServerContext> = (
  ...args: Args
) => (ctx: Context) => R;

// export type TEFlow2<R> = (
//   ctx: ServerContext,
// ) => TE.TaskEither<ControllerError, R>;

export type TEReader<R, Context = ServerContext> = ReaderTaskEither<
  Context,
  ControllerError,
  R
>;

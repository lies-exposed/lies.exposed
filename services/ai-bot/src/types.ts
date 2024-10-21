import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type AIBotError } from "./common/error/index.js";
import { type ClientContext } from "./context.js";

/**
 * TEReaderC is a ReaderTaskEither with a ClientContext and ControllerError
 */
export type ClientContextRTE<A> = ReaderTaskEither<
  ClientContext,
  AIBotError,
  A
>;

export type ClientContextTE<A> = TaskEither<ClientContext, A>;

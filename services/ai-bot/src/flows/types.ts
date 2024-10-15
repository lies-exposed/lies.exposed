import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ApiBotError } from "../common/error/index.js";
import { type ClientContext } from "../context.js";

/**
 * TEReaderC is a ReaderTaskEither with a ClientContext and ControllerError
 */
export type ClientContextRTE<A> = ReaderTaskEither<
  ClientContext,
  ApiBotError,
  A
>;

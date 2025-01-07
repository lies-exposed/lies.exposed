import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ServerError } from "../../../errors/index.js";

export type ExtractThumbnailFromMediaFlow<T> = <C>(
  r: T,
) => ReaderTaskEither<C, ServerError, ArrayBuffer[]>;

export type ExtractThumbnailFromRTE<C = unknown> = ReaderTaskEither<
  C,
  ServerError,
  ArrayBuffer[]
>;

import { fp } from "@liexp/core/lib/fp/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { type Decode } from "io-ts";
import {
  type _DecodeError,
  DecodeError,
} from "../io/http/Error/DecodeError.js";

export const ENVParser =
  <E>(envDecode: Decode<unknown, E>) =>
  (env: unknown): Either<_DecodeError, E> => {
    return pipe(
      envDecode(env),
      fp.E.mapLeft((e) => DecodeError.of(`Failed to decode process env`, e)),
    );
  };

import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { GetEndpointSubscriber } from "ts-endpoint-express/lib/index.js";
import { type Codec } from "ts-io-error";
import { type ControllerError } from "#io/ControllerError.js";

export const AddEndpoint = GetEndpointSubscriber({
  buildDecodeError: (e): ControllerError => {
    return e as ControllerError;
  },
  decode:
    <A, I, E = unknown>(S: Codec<A, I, E>) =>
    (u) =>
      pipe(
        Schema.decodeUnknownEither(S as Schema.Schema<A, I, never>)(u),
        E.mapLeft((e) => DecodeError.of("Endpoint validation failed", e)),
      ),
});

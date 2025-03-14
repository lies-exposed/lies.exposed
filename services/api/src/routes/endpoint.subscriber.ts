import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { GetEndpointSubscriber } from "ts-endpoint-express/lib/index.js";
import { type Codec } from "ts-io-error";
import { type ControllerError } from "#io/ControllerError.js";

export const AddEndpoint = GetEndpointSubscriber({
  buildDecodeError: (e): ControllerError => {
    return DecodeError.of("Endpoint validation failed", e as any);
  },
  decode:
    <A, I>(S: Codec<A, I, never>) =>
    (u) =>
      pipe(
        Schema.encodeUnknownEither(S as Schema.Schema<A, I>)(u),
        E.mapLeft((e) => DecodeError.of("Endpoint validation failed", e)),
      ),
});

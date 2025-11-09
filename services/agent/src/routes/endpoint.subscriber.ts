import { type ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { GetEndpointSubscriber } from "@ts-endpoint/express";

export const AddEndpoint = GetEndpointSubscriber({
  buildDecodeError: (e): ServerError => {
    return e as ServerError;
  },
  decode: EffectDecoder((e) => DecodeError.of("Endpoint validation failed", e)),
});

import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { GetEndpointSubscriber } from "@ts-endpoint/express";
import { type ControllerError } from "#io/ControllerError.js";

export const AddEndpoint = GetEndpointSubscriber({
  buildDecodeError: (e): ControllerError => {
    return e as ControllerError;
  },
  decode: EffectDecoder((e) => DecodeError.of("Endpoint validation failed", e)),
});

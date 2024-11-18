import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { GetEndpointSubscriber } from "ts-endpoint-express";
import { type ControllerError } from "#io/ControllerError.js";

export const AddEndpoint = GetEndpointSubscriber((e): ControllerError => {
  return DecodeError.of("Endpoint validation failed", e as any[]);
});

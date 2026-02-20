import { Schema } from "effect";
import { UUID } from "../Common/UUID.js";

export const OpenAIUpdateEntitiesFromURLType = Schema.Literal(
  "openai-update-entities-from-url",
);
export type OpenAIUpdateEntitiesFromURLType =
  typeof OpenAIUpdateEntitiesFromURLType.Type;

export const UpdateEntitiesFromURLQueueData = Schema.Struct({
  linkId: UUID,
}).annotations({
  title: "UpdateEntitiesFromURLQueueData",
});

export type UpdateEntitiesFromURLQueueData =
  typeof UpdateEntitiesFromURLQueueData.Type;

import { Schema } from "effect";
import { URL } from "../../Common/URL.js";
import { EventType } from "../../Events/index.js";

export const OpenAICreateEventFromURLType = Schema.Literal(
  "openai-create-event-from-url",
);
export type OpenAICreateEventFromURLType =
  typeof OpenAICreateEventFromURLType.Type;

export const CreateEventFromURLQueueData = Schema.Struct({
  url: URL,
  type: EventType,
});

export type CreateEventFromURLQueueData =
  typeof CreateEventFromURLQueueData.Type;

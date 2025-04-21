import { Schema } from "effect";
import { EventType } from "../../Events/EventType.js";

export const OpenAICreateEventFromTextType = Schema.Literal(
  "openai-create-event-from-text",
);
export type OpenAICreateEventFromTextType =
  typeof OpenAICreateEventFromTextType.Type;

export const CreateEventFromTextQueueData = Schema.Struct({
  text: Schema.String,
  type: EventType,
}).annotations({
  title: "CreateEventFromTextQueueData",
});
export type CreateEventFromTextQueueData =
  typeof CreateEventFromTextQueueData.Type;

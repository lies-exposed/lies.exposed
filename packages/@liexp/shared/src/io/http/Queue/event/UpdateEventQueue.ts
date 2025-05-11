import { Schema } from "effect";
import { URL } from "../../Common/URL.js";
import { EventType } from "../../Events/index.js";

export const OpenAIUpdateEventQueueType = Schema.Literal("openai-update-event");
export type OpenAIUpdateEventQueueType = typeof OpenAIUpdateEventQueueType.Type;

export const UpdateEventQueueData = Schema.Struct({
  type: EventType,
  urls: Schema.Array(URL),
  currentExcerpt: Schema.Union(Schema.String, Schema.Undefined),
  date: Schema.Union(Schema.Date, Schema.Undefined),
});

export type UpdateEventQueueData = typeof UpdateEventQueueData.Type;

import { Schema } from "effect";
import { UUID } from "../../Common/UUID.js";
import { EventType } from "../../Events/index.js";

export const OpenAIUpdateEventQueueType = Schema.Literal("openai-update-event");
export type OpenAIUpdateEventQueueType = typeof OpenAIUpdateEventQueueType.Type;

export const UpdateEventQueueData = Schema.Struct({
  id: UUID,
  type: EventType,
});

export type UpdateEventQueueData = typeof UpdateEventQueueData.Type;

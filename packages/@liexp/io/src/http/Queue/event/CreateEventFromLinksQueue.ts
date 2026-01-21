import { Schema } from "effect";
import { UUID } from "../../Common/UUID.js";
import { EventType } from "../../Events/EventType.js";

export const OpenAICreateEventFromLinksType = Schema.Literal(
  "openai-create-event-from-links",
);
export type OpenAICreateEventFromLinksType =
  typeof OpenAICreateEventFromLinksType.Type;

export const CreateEventFromLinksQueueData = Schema.Struct({
  linkIds: Schema.Array(UUID),
  type: EventType,
  date: Schema.Union(Schema.Date, Schema.Undefined),
}).annotations({
  title: "CreateEventFromLinksQueueData",
});

export type CreateEventFromLinksQueueData =
  typeof CreateEventFromLinksQueueData.Type;

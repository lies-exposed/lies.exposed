import * as t from "io-ts";
import { EventType } from "../../Events/EventType.js";

export const OpenAICreateEventFromTextType = t.literal(
  "openai-create-event-from-text",
);
export type OpenAICreateEventFromTextType = t.TypeOf<
  typeof OpenAICreateEventFromTextType
>;

export const CreateEventFromTextQueueData = t.type(
  {
    text: t.string,
    type: EventType,
  },
  "CreateEventFromTextQueueData",
);
export type CreateEventFromTextQueueData = t.TypeOf<
  typeof CreateEventFromTextQueueData
>;

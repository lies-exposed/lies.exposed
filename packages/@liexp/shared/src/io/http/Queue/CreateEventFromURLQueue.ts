import * as t from "io-ts";
import { EventType } from "../Events/index.js";

export const OpenAICreateEventFromURLType = t.literal(
  "openai-create-event-from-url",
);
export type OpenAICreateEventFromURLType = t.TypeOf<
  typeof OpenAICreateEventFromURLType
>;

export const CreateEventFromURLQueueData = t.strict(
  {
    url: t.string,
    type: EventType,
  },
  "CreateEventFromURLQueueData",
);
export type CreateEventFromURLQueueData = t.TypeOf<
  typeof CreateEventFromURLQueueData
>;

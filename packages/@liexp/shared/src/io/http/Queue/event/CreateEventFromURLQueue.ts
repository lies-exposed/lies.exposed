import * as t from "io-ts";
import { EventFromURLBody } from "../../Events/index.js";

export const OpenAICreateEventFromURLType = t.literal(
  "openai-create-event-from-url",
);
export type OpenAICreateEventFromURLType = t.TypeOf<
  typeof OpenAICreateEventFromURLType
>;

export const CreateEventFromURLQueueData = EventFromURLBody;

export type CreateEventFromURLQueueData = t.TypeOf<
  typeof CreateEventFromURLQueueData
>;

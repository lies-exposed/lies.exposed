import * as t from "io-ts";
import {
  CreateEventFromTextQueueData,
  OpenAICreateEventFromTextType,
} from "./CreateEventFromTextQueueData.js";
import {
  CreateEventFromURLQueueData,
  OpenAICreateEventFromURLType,
} from "./CreateEventFromURLQueue.js";

export const CreateEventFromURLTypeData = t.type(
  {
    type: OpenAICreateEventFromURLType,
    data: CreateEventFromURLQueueData,
  },
  "CreateEventFromURLTypeData",
);

export type CreateEventFromTextTypeData = t.TypeOf<
  typeof CreateEventFromTextTypeData
>;

export const CreateEventFromTextTypeData = t.type(
  {
    type: OpenAICreateEventFromTextType,
    data: CreateEventFromTextQueueData,
  },
  "CreateEventFromTextTypeData",
);

export type CreateEventFromURLTypeData = t.TypeOf<
  typeof CreateEventFromURLTypeData
>;

export const CreateQueueEvent = t.union(
  [CreateEventFromURLTypeData, CreateEventFromTextTypeData],
  "CreateQueueEvent",
);

export type CreateQueueEvent = t.TypeOf<typeof CreateQueueEvent>;

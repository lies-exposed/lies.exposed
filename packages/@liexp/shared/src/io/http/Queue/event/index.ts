import { Schema } from "effect";
import {
  CreateEventFromTextQueueData,
  OpenAICreateEventFromTextType,
} from "./CreateEventFromTextQueueData.js";
import {
  CreateEventFromURLQueueData,
  OpenAICreateEventFromURLType,
} from "./CreateEventFromURLQueue.js";

export const CreateEventFromURLTypeData = Schema.Struct({
  type: OpenAICreateEventFromURLType,
  data: CreateEventFromURLQueueData,
}).annotations({ title: "CreateEventFromURLTypeData" });

export type CreateEventFromTextTypeData =
  typeof CreateEventFromTextTypeData.Type;

export const CreateEventFromTextTypeData = Schema.Struct({
  type: OpenAICreateEventFromTextType,
  data: CreateEventFromTextQueueData,
}).annotations({ title: "CreateEventFromTextTypeData" });

export type CreateEventFromURLTypeData = typeof CreateEventFromURLTypeData.Type;

export const CreateQueueEvent = Schema.Union(
  CreateEventFromTextTypeData,
  CreateEventFromURLTypeData,
).annotations({
  title: "CreateQueueEvent",
});

export type CreateQueueEvent = typeof CreateQueueEvent.Type;

import { Schema } from "effect";
import {
  CreateEventFromLinksQueueData,
  OpenAICreateEventFromLinksType,
} from "./CreateEventFromLinksQueue.js";
import {
  CreateEventFromTextQueueData,
  OpenAICreateEventFromTextType,
} from "./CreateEventFromTextQueueData.js";
import {
  CreateEventFromURLQueueData,
  OpenAICreateEventFromURLType,
} from "./CreateEventFromURLQueue.js";
import {
  OpenAIUpdateEventQueueType,
  UpdateEventQueueData,
} from "./UpdateEventQueue.js";

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

export const UpdateEventTypeData = Schema.Struct({
  type: OpenAIUpdateEventQueueType,
  data: UpdateEventQueueData,
}).annotations({ identifier: "UpdateEventTypeData" });

export type UpdateEventTypeData = typeof UpdateEventTypeData.Type;

export const CreateEventFromLinksTypeData = Schema.Struct({
  type: OpenAICreateEventFromLinksType,
  data: CreateEventFromLinksQueueData,
}).annotations({ title: "CreateEventFromLinksTypeData" });

export type CreateEventFromLinksTypeData =
  typeof CreateEventFromLinksTypeData.Type;

export const EventQueue = Schema.Union(
  CreateEventFromTextTypeData,
  CreateEventFromURLTypeData,
  CreateEventFromLinksTypeData,
  UpdateEventTypeData,
).annotations({
  identifier: "EventQueue",
});

export type EventQueue = typeof EventQueue.Type;

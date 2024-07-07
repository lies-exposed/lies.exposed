import * as t from "io-ts";
import { optionFromUndefined } from "../Common/optionFromUndefined.js";
import { ResourcesNames } from "./ResourcesNames.js";

export const QueueResourceNames = ResourcesNames;
export type QueueResourceNames = t.TypeOf<typeof QueueResourceNames>;

export const QueueTypes = t.union(
  [t.literal("openai-embedding"), t.literal("openai-summarize")],
  "QueueTypes",
);

export type QueueTypes = t.TypeOf<typeof QueueTypes>;

export const Status = t.union([
  t.literal("pending"),
  t.literal("processing"),
  t.literal("completed"),
  t.literal("failed"),
]);
export type Status = t.TypeOf<typeof Status>;

export const GetQueueParams = t.type(
  {
    resource: QueueResourceNames,
    type: QueueTypes,
    id: t.string,
  },
  "GetQueueParams",
);
export type GetQueueParams = t.TypeOf<typeof GetQueueParams>;

export const GetQueueListQuery = t.type(
  {
    resource: optionFromUndefined(QueueResourceNames),
    type: optionFromUndefined(QueueTypes),
    status: optionFromUndefined(Status),
  },
  "GetQueueListQuery",
);
export type GetQueueListQuery = t.TypeOf<typeof GetQueueListQuery>;

export const CreateQueue = t.strict(
  {
    id: t.string,
    data: t.any,
  },
  "CreateQueue",
);

export type CreateQueue = t.TypeOf<typeof CreateQueue>;

export const Queue = t.strict(
  {
    ...CreateQueue.type.props,
    resource: QueueResourceNames,
    type: QueueTypes,
    status: Status,
    error: t.union([t.record(t.string, t.any), t.null]),
  },
  "Queue",
);

export type Queue = t.TypeOf<typeof Queue>;

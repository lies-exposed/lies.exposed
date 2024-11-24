import * as t from "io-ts";
import { optionFromUndefined } from "../Common/optionFromUndefined.js";
import { UUID } from "./Common/UUID.js";
import { ResourcesNames } from "./ResourcesNames.js";

export const QueueResourceNames = ResourcesNames;
export type QueueResourceNames = t.TypeOf<typeof QueueResourceNames>;

export const OpenAIEmbeddingQueueType = t.literal("openai-embedding");
export type OpenAIEmbeddingQueueType = t.TypeOf<
  typeof OpenAIEmbeddingQueueType
>;

export const OpenAISummarizeQueueType = t.literal("openai-summarize");
export type OpenAISummarizeQueueType = t.TypeOf<
  typeof OpenAISummarizeQueueType
>;

export const QueueTypes = t.union(
  [OpenAIEmbeddingQueueType, OpenAISummarizeQueueType],
  "QueueTypes",
);

export type QueueTypes = t.TypeOf<typeof QueueTypes>;

export const PendingStatus = t.literal("pending");
export type PendingStatus = t.TypeOf<typeof PendingStatus>;

export const ProcessingStatus = t.literal("processing");
export type ProcessingStatus = t.TypeOf<typeof ProcessingStatus>;

export const DoneStatus = t.literal("done");
export type DoneStatus = t.TypeOf<typeof DoneStatus>;

export const CompletedStatus = t.literal("completed");
export type CompletedStatus = t.TypeOf<typeof CompletedStatus>;

export const FailedStatus = t.literal("failed");
export type FailedStatus = t.TypeOf<typeof FailedStatus>;

export const Status = t.union([
  PendingStatus,
  ProcessingStatus,
  DoneStatus,
  CompletedStatus,
  FailedStatus,
]);
export type Status = t.TypeOf<typeof Status>;

export const GetQueueParams = t.type(
  {
    resource: QueueResourceNames,
    type: QueueTypes,
    id: UUID,
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

export const CreateQueueURLData = t.strict(
  {
    url: t.string,
    result: t.union([t.string, t.undefined]),
    type: t.union([t.literal("link"), t.literal("pdf"), t.undefined]),
  },
  "CreateQueueURLData",
);
export type CreateQueueURLData = t.TypeOf<typeof CreateQueueURLData>;

export const CreateQueueTextData = t.strict(
  { text: t.string, result: t.union([t.string, t.undefined]) },
  "CreateQueueTextData",
);
export type CreateQueueTextData = t.TypeOf<typeof CreateQueueTextData>;

export const CreateQueue = t.strict(
  {
    id: UUID,
    data: t.union([CreateQueueURLData, CreateQueueTextData]),
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

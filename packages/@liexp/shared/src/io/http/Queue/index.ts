import * as t from "io-ts";
import { optionFromUndefined } from "../../Common/optionFromUndefined.js";
import { URL } from "../Common/URL.js";
import { UUID } from "../Common/UUID.js";
import { PaginationQuery } from "../Query/PaginationQuery.js";
import { SortQuery } from "../Query/SortQuery.js";
import { ResourcesNames } from "../ResourcesNames.js";
import { OpenAICreateEventFromTextType } from "./event/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "./event/CreateEventFromURLQueue.js";
import { CreateQueueEvent } from "./event/index.js";

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
  [
    OpenAIEmbeddingQueueType,
    OpenAISummarizeQueueType,
    OpenAICreateEventFromURLType,
    OpenAICreateEventFromTextType,
  ],
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
    ...SortQuery.props,
    ...PaginationQuery.props,
    resource: optionFromUndefined(QueueResourceNames),
    type: optionFromUndefined(QueueTypes),
    status: optionFromUndefined(Status),
  },
  "GetQueueListQuery",
);
export type GetQueueListQuery = t.TypeOf<typeof GetQueueListQuery>;

export const CreateQueueURLData = t.strict(
  {
    url: URL,
    type: t.union([t.literal("link"), t.literal("pdf"), t.undefined]),
  },
  "CreateQueueURLData",
);
export type CreateQueueURLData = t.TypeOf<typeof CreateQueueURLData>;

export const CreateQueueURLTypeData = t.strict(
  {
    type: OpenAIEmbeddingQueueType,
    data: CreateQueueURLData,
  },
  "CreateQueueURLTypeData",
);

export type CreateQueueURLTypeData = t.TypeOf<typeof CreateQueueURLTypeData>;

export const CreateQueueTextData = t.strict(
  {
    text: t.string,
  },
  "CreateQueueTextData",
);
export type CreateQueueTextData = t.TypeOf<typeof CreateQueueTextData>;

export const CreateQueueTextTypeData = t.strict(
  {
    type: OpenAISummarizeQueueType,
    data: CreateQueueTextData,
  },
  "CreateQueueText",
);
export type CreateQueueTextTypeData = t.TypeOf<typeof CreateQueueTextTypeData>;

const CreateQueueTypeData = t.union([
  CreateQueueEvent,
  CreateQueueURLTypeData,
  CreateQueueTextTypeData,
]);

export const CreateQueue = t.intersection(
  [
    t.strict({
      id: UUID,
      question: t.union([t.string, t.null]),
      result: t.union([t.string, t.null, t.any]),
      prompt: t.union([t.string, t.null]),
    }),
    CreateQueueTypeData,
  ],
  "CreateQueue",
);

export type CreateQueue = t.TypeOf<typeof CreateQueue>;

export const Queue = t.intersection([
  t.strict(
    {
      ...CreateQueue.types[0].type.props,
      resource: QueueResourceNames,
      status: Status,
      error: t.union([t.record(t.string, t.any), t.null]),
    },
    "Queue",
  ),
  CreateQueueTypeData,
]);

export type Queue = t.TypeOf<typeof Queue>;

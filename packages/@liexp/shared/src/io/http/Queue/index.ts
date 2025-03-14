import { Schema } from "effect";
import { URL } from "../Common/URL.js";
import { UUID } from "../Common/UUID.js";
import { PaginationQuery } from "../Query/PaginationQuery.js";
import { SortQuery } from "../Query/SortQuery.js";
import { ResourcesNames } from "../ResourcesNames.js";
import {
  CreateEventFromTextQueueData,
  OpenAICreateEventFromTextType,
} from "./event/CreateEventFromTextQueueData.js";
import {
  CreateEventFromURLQueueData,
  OpenAICreateEventFromURLType,
} from "./event/CreateEventFromURLQueue.js";
import { CreateQueueEvent } from "./event/index.js";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

export const QueueResourceNames = ResourcesNames;
export type QueueResourceNames = typeof QueueResourceNames.Type;

export const OpenAIEmbeddingQueueType = Schema.Literal("openai-embedding");
export type OpenAIEmbeddingQueueType = typeof OpenAIEmbeddingQueueType.Type;

export const OpenAISummarizeQueueType = Schema.Literal("openai-summarize");
export type OpenAISummarizeQueueType = typeof OpenAISummarizeQueueType.Type;

export const QueueTypes = Schema.Union(
  OpenAIEmbeddingQueueType,
  OpenAISummarizeQueueType,
  OpenAICreateEventFromURLType,
  OpenAICreateEventFromTextType,
).annotations({
  title: "QueueTypes",
});

export type QueueTypes = typeof QueueTypes.Type;

export const PendingStatus = Schema.Literal("pending");
export type PendingStatus = typeof PendingStatus.Type;

export const ProcessingStatus = Schema.Literal("processing");
export type ProcessingStatus = typeof ProcessingStatus.Type;

export const DoneStatus = Schema.Literal("done");
export type DoneStatus = typeof DoneStatus.Type;

export const CompletedStatus = Schema.Literal("completed");
export type CompletedStatus = typeof CompletedStatus.Type;

export const FailedStatus = Schema.Literal("failed");
export type FailedStatus = typeof FailedStatus.Type;

export const Status = Schema.Union(
  PendingStatus,
  ProcessingStatus,
  DoneStatus,
  CompletedStatus,
  FailedStatus,
);
export type Status = typeof Status.Type;

export const GetQueueParams = Schema.Struct({
  resource: QueueResourceNames,
  type: QueueTypes,
  id: UUID,
}).annotations({
  title: "GetQueueParams",
});
export type GetQueueParams = typeof GetQueueParams.Type;

export const GetQueueListQuery = Schema.Struct({
  ...SortQuery.fields,
  ...PaginationQuery.fields,
  resource: OptionFromNullishToNull(QueueResourceNames),
  type: OptionFromNullishToNull(QueueTypes),
  status: OptionFromNullishToNull(Schema.Array(Status)),
}).annotations({
  title: "GetQueueListQuery",
});
export type GetQueueListQuery = typeof GetQueueListQuery.Type;

export const CreateQueueURLData = Schema.Struct({
  url: URL,
  type: Schema.Union(
    Schema.Literal("link"),
    Schema.Literal("pdf"),
    Schema.Undefined,
  ),
}).annotations({
  title: "CreateQueueURLData",
});
export type CreateQueueURLData = typeof CreateQueueURLData.Type;

export const CreateQueueTextData = Schema.Struct({
  text: Schema.String,
}).annotations({
  title: "CreateQueueTextData",
});
export type CreateQueueTextData = typeof CreateQueueTextData.Type;

export type CreateQueueEmbeddingTypeData =
  typeof CreateQueueEmbeddingTypeData.Type;

export const CreateQueueEmbeddingTypeData = Schema.Struct({
  type: OpenAIEmbeddingQueueType,
  data: Schema.Union(CreateQueueURLData, CreateQueueTextData),
}).annotations({
  title: "CreateQueueURLTypeData",
});

export const CreateQueueTextTypeData = Schema.Struct({
  type: OpenAISummarizeQueueType,
  data: CreateQueueTextData,
}).annotations({
  title: "CreateQueueText",
});
export type CreateQueueTextTypeData = typeof CreateQueueTextTypeData.Type;

const CreateQueueData = Schema.Union(
  CreateEventFromTextQueueData,
  CreateQueueTextData,
  CreateQueueURLData,
  CreateEventFromURLQueueData,
).annotations({
  title: "CreateQueueData",
});

export const CreateQueue = Schema.Struct({
  id: UUID,
  question: OptionFromNullishToNull(Schema.String),
  result: OptionFromNullishToNull(Schema.String),
  prompt: OptionFromNullishToNull(Schema.String),
  data: CreateQueueData,
}).annotations({
  title: "CreateQueue",
});

export type CreateQueue = typeof CreateQueue.Type;

const CreateQueueTypeData = Schema.Union(
  ...CreateQueueEvent.members,
  CreateQueueEmbeddingTypeData,
  CreateQueueTextTypeData,
);

export const Queue = Schema.extend(
  Schema.Struct({
    id: UUID,
    question: Schema.Union(Schema.String, Schema.Null),
    result: Schema.Union(Schema.String, Schema.Null, Schema.Any),
    prompt: Schema.Union(Schema.String, Schema.Null),
    resource: QueueResourceNames,
    status: Status,
    error: Schema.Union(
      Schema.Record({ key: Schema.String, value: Schema.Any }),
      Schema.Null,
    ),
  }),
  CreateQueueTypeData,
).annotations({ title: "Queue" });

export type Queue = typeof Queue.Type;

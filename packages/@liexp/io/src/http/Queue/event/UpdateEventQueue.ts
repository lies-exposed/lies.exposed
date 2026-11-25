import { Schema } from "effect";
import { UUID } from "../../Common/UUID.js";
import { EventType } from "../../Events/index.js";

export const OpenAIUpdateEventQueueType = Schema.Literal("openai-update-event");
export type OpenAIUpdateEventQueueType = typeof OpenAIUpdateEventQueueType.Type;

export const UpdateEventQueueData = Schema.Struct({
  id: UUID,
  type: EventType,
});

export type UpdateEventQueueData = typeof UpdateEventQueueData.Type;

export const UpdateEventAgentOutputChange = Schema.Struct({
  field: Schema.String,
  before: Schema.NullOr(Schema.String),
  after: Schema.NullOr(Schema.String),
}).annotations({ title: "UpdateEventAgentOutputChange" });

export type UpdateEventAgentOutputChange =
  typeof UpdateEventAgentOutputChange.Type;

export const UpdateEventAgentOutputMissing = Schema.Struct({
  actors: Schema.Array(Schema.String),
  groups: Schema.Array(Schema.String),
  keywords: Schema.Array(Schema.String),
}).annotations({ title: "UpdateEventAgentOutputMissing" });

export type UpdateEventAgentOutputMissing =
  typeof UpdateEventAgentOutputMissing.Type;

export const UpdateEventAgentOutput = Schema.Struct({
  title: Schema.NullOr(Schema.String),
  date: Schema.NullOr(Schema.DateFromString),
  excerpt: Schema.NullOr(Schema.String),
  location: Schema.NullOr(UUID),
  endDate: Schema.NullOr(Schema.DateFromString),
  quote: Schema.NullOr(Schema.String),
  details: Schema.NullOr(Schema.String),
  total: Schema.NullOr(Schema.Number),
  currency: Schema.NullOr(Schema.String),
  actors: Schema.Array(UUID),
  groups: Schema.Array(UUID),
  keywords: Schema.Array(UUID),
  missing: UpdateEventAgentOutputMissing,
  changes: Schema.Array(UpdateEventAgentOutputChange),
}).annotations({ title: "UpdateEventAgentOutput" });

export type UpdateEventAgentOutput = typeof UpdateEventAgentOutput.Type;

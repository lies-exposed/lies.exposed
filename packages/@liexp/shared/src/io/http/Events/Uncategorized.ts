import { Schema } from "effect";
import { UUID } from "../Common/index.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { UNCATEGORIZED } from "./EventType.js";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

export const CreateEventBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: UNCATEGORIZED,
  payload: Schema.Struct({
    title: Schema.String,
    actors: Schema.Array(UUID),
    groups: Schema.Array(UUID),
    groupsMembers: Schema.Array(UUID),
    location: OptionFromNullishToNull(UUID),
    endDate: OptionFromNullishToNull(Schema.DateFromString),
  }),
}).annotations({
  title: "CreateEventBody",
});

export type CreateEventBody = typeof CreateEventBody.Type;

export const EditEventBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: UNCATEGORIZED,
  payload: Schema.Struct({
    title: Schema.String,
    location: OptionFromNullishToNull(UUID),
    actors: Schema.Array(Schema.String),
    groups: Schema.Array(Schema.String),
    groupsMembers: Schema.Array(Schema.String),
    endDate: OptionFromNullishToNull(Schema.DateFromString),
  }),
}).annotations({
  title: "EditEventPayload",
});

export type EditEventBody = typeof EditEventBody.Type;

export const UncategorizedV2Payload = Schema.Struct({
  title: Schema.String,
  location: Schema.Union(UUID, Schema.Undefined),
  endDate: Schema.Union(Schema.DateFromString, Schema.Undefined),
  actors: Schema.Array(UUID),
  groups: Schema.Array(UUID),
  groupsMembers: Schema.Array(UUID),
}).annotations({
  title: "UncategorizedV2Payload",
});

export type UncategorizedV2Payload = typeof UncategorizedV2Payload.Type;

export const Uncategorized = Schema.Struct({
  ...EventCommon.fields,
  type: UNCATEGORIZED,
  payload: UncategorizedV2Payload,
}).annotations({
  title: "UncategorizedEvent",
});

export type Uncategorized = typeof Uncategorized.Type;

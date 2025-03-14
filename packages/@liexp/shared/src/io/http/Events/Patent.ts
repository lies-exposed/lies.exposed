import { Schema } from "effect";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull.js";
import { UUID } from "../Common/UUID.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { PATENT } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const PatentListQuery = Schema.Struct({
  ...GetSearchEventsQuery.omit("eventType").fields,
  minDate: OptionFromNullishToNull(Schema.DateFromString),
  maxDate: OptionFromNullishToNull(Schema.DateFromString),
}).annotations({
  title: "PatentListQuery",
});
export type PatentListQuery = typeof PatentListQuery.Type;

export const PatentPayload = Schema.Struct({
  title: Schema.String,
  owners: Schema.Struct({
    actors: Schema.Array(UUID),
    groups: Schema.Array(UUID),
  }),
  source: Schema.Union(UUID, Schema.Undefined),
});
export type PatentPayload = typeof PatentPayload.Type;

export const Patent = Schema.Struct({
  ...EventCommon.fields,
  type: PATENT,
  payload: PatentPayload,
});

export type Patent = typeof Patent.Type;

export const CreatePatentBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: PATENT,
  payload: Schema.Struct({
    title: Schema.String,
    owners: Schema.Struct({
      actors: Schema.Array(UUID),
      groups: Schema.Array(UUID),
    }),
    source: UUID,
  }),
}).annotations({
  title: "CreatePatentBody",
});

export type CreatePatentBody = typeof CreatePatentBody.Type;

export const EditPatentBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: PATENT,
  payload: PatentPayload,
});
export type EditPatentBody = typeof EditPatentBody.Type;

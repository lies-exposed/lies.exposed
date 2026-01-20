import { Schema } from "effect";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull.js";
import { UUID } from "../Common/UUID.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { DEATH } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const DeathListQuery = Schema.Struct({
  ...GetSearchEventsQuery.omit("eventType").fields,
  victim: OptionFromNullishToNull(Schema.Array(UUID)),
  minDate: OptionFromNullishToNull(Schema.Date),
  maxDate: OptionFromNullishToNull(Schema.Date),
}).annotations({ title: "DeathListQuery" });

export type DeathListQuery = typeof DeathListQuery.Type;

export const CreateDeathBody = Schema.Struct({
  ...CreateEventCommon.fields,
  type: DEATH,
  payload: Schema.Struct({
    victim: UUID,
    location: OptionFromNullishToNull(UUID),
  }),
}).annotations({
  title: "CreateDeathBody",
});

export type CreateDeathBody = typeof CreateDeathBody.Type;

export const EditDeathBody = Schema.Struct({
  ...EditEventCommon.fields,
  type: DEATH,
  payload: Schema.Struct({
    victim: UUID,
    location: OptionFromNullishToNull(UUID),
  }),
}).annotations({ title: "CreateDeathBody" });

export type EditDeathBody = typeof EditDeathBody.Type;

export const DeathPayload = Schema.Struct({
  victim: UUID,
  location: Schema.Union(UUID, Schema.Undefined),
}).annotations({ title: "DeathPayload" });
export type DeathPayload = typeof DeathPayload.Type;

export const Death = Schema.Struct({
  ...EventCommon.fields,
  type: DEATH,
  payload: DeathPayload,
}).annotations({ title: "DeathEvent" });

export type Death = typeof Death.Type;

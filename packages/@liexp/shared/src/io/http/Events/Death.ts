import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { DEATH } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const DeathListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["eventType"]),
    victim: optionFromNullable(t.array(UUID)),
    minDate: optionFromNullable(DateFromISOString),
    maxDate: optionFromNullable(DateFromISOString),
  },
  "DeathListQuery",
);
export type DeathListQuery = t.TypeOf<typeof DeathListQuery>;

export const CreateDeathBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: DEATH,
    payload: t.strict({
      victim: UUID,
      location: optionFromNullable(UUID),
    }),
  },
  "CreateDeathBody",
);

export type CreateDeathBody = t.TypeOf<typeof CreateDeathBody>;

export const EditDeathBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: DEATH,
    payload: t.strict({
      victim: UUID,
      location: optionFromNullable(UUID),
    }),
  },
  "CreateDeathBody",
);

export type EditDeathBody = t.TypeOf<typeof EditDeathBody>;

export const DeathPayload = t.strict(
  {
    victim: UUID,
    location: t.union([UUID, t.undefined]),
  },
  "DeathV2",
);
export type DeathPayload = t.TypeOf<typeof DeathPayload>;

export const Death = t.strict(
  {
    ...EventCommon.type.props,
    type: DEATH,
    payload: DeathPayload,
  },
  "DeathEvent",
);
export type Death = t.TypeOf<typeof Death>;

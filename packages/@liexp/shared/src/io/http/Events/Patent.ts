import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import {
  CreateEventCommon,
  EditEventCommon,
  EventCommon,
} from "./BaseEvent.js";
import { PATENT } from "./EventType.js";
import { GetSearchEventsQuery } from "./SearchEvents/SearchEventsQuery.js";

export const PatentListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["eventType"]),
    minDate: optionFromNullable(DateFromISOString),
    maxDate: optionFromNullable(DateFromISOString),
  },
  "PatentListQuery",
);
export type PatentListQuery = t.TypeOf<typeof PatentListQuery>;

export const PatentPayload = t.strict(
  {
    title: t.string,
    owners: t.strict({
      actors: t.array(UUID),
      groups: t.array(UUID),
    }),
    source: UUID,
  },
  "PatentPayload",
);
export type PatentPayload = t.TypeOf<typeof PatentPayload>;

export const Patent = t.strict(
  {
    ...EventCommon.type.props,
    type: PATENT,
    payload: PatentPayload,
  },
  PATENT.value,
);
export type Patent = t.TypeOf<typeof Patent>;

export const CreatePatentBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: PATENT,
    payload: t.strict({
      title: t.string,
      owners: t.strict({
        actors: t.array(UUID),
        groups: t.array(UUID),
      }),
      source: UUID,
    }),
  },
  "CreatePatentBody",
);

export type CreatePatentBody = t.TypeOf<typeof CreatePatentBody>;

export const EditPatentBody = t.strict({
  ...EditEventCommon.type.props,
  type: PATENT,
  payload: PatentPayload,
});
export type EditPatentBody = t.TypeOf<typeof EditPatentBody>;

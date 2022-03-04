import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { propsOmit } from "../../utils";
import { URL } from "../Common";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";
import { GetSearchEventsQuery } from "./SearchEventsQuery";

export const PatentListQuery = t.strict(
  {
    ...propsOmit(GetSearchEventsQuery, ["type"]),
    minDate: optionFromNullable(DateFromISOString),
    maxDate: optionFromNullable(DateFromISOString),
  },
  "PatentListQuery"
);
export type PatentListQuery = t.TypeOf<typeof PatentListQuery>;

export const PATENT = t.literal("Patent");
export type PATENT = t.TypeOf<typeof PATENT>;

export const PatentPayload = t.strict(
  {
    title: t.string,
    owners: t.strict({
      actors: t.array(UUID),
      groups: t.array(UUID),
    }),
    source: URL,
  },
  "PatentPayload"
);
export type PatentPayload = t.TypeOf<typeof PatentPayload>;

export const Patent = t.strict(
  {
    ...EventCommon.type.props,
    type: PATENT,
    payload: PatentPayload,
  },
  PATENT.value
);
export type Patent = t.TypeOf<typeof Patent>;

export const CreatePatentBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: PATENT,
    payload: t.strict({
      title: t.string,
      owners: t.strict({
        actors: optionFromNullable(t.array(UUID)),
        groups: optionFromNullable(t.array(UUID)),
      }),
      source: URL,
    }),
  },
  "CreatePatentBody"
);

export type CreatePatentBody = t.TypeOf<typeof CreatePatentBody>;

export const EditPatentBody = t.strict({
  ...EditEventCommon.type.props,
  type: PATENT,
  payload: PatentPayload,
});

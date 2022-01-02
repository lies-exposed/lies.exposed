import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyRecordFromType } from "../../Common";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { Point, UUID } from "../Common";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent";

export const UncategorizedType = t.literal("Uncategorized");
export type UncategorizedType = t.TypeOf<typeof UncategorizedType>;

export const CreateEventBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: UncategorizedType,
    payload: t.strict({
      title: t.string,
      actors: t.array(UUID),
      groups: t.array(UUID),
      groupsMembers: t.array(UUID),
      location: optionFromUndefined(Point),
      endDate: optionFromUndefined(DateFromISOString),
      body: t.UnknownRecord,
    }),
  },
  "CreateEventBody"
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = nonEmptyRecordFromType(
  {
    ...EditEventCommon.type.props,
    type: UncategorizedType,
    payload: t.strict({
      title: t.string,
      location: optionFromUndefined(Point),
      actors: t.array(t.string),
      groups: t.array(t.string),
      groupsMembers: t.array(t.string),
      endDate: optionFromUndefined(DateFromISOString),
      body: t.UnknownRecord,
    }),
  },
  "EditEventPayload"
);

export type EditEventBody = t.TypeOf<typeof EditEventBody>;

export const UncategorizedV2Payload = t.strict(
  {
    title: t.string,
    location: t.union([Point, t.undefined]),
    endDate: t.union([DateFromISOString, t.undefined]),
    body: t.UnknownRecord,
    actors: t.array(UUID),
    groups: t.array(UUID),
    groupsMembers: t.array(UUID),
  },
  "UncategorizedV2"
);

export type UncategorizedV2Payload = t.TypeOf<typeof UncategorizedV2Payload>;

export const Uncategorized = t.strict(
  {
    ...EventCommon.type.props,
    type: UncategorizedType,
    payload: UncategorizedV2Payload,
  },
  "UncategorizedEventV2"
);

export type Uncategorized = t.TypeOf<typeof Uncategorized>;

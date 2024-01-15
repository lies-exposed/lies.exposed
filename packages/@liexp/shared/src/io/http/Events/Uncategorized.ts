import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromUndefined } from "../../Common/optionFromUndefined.js";
import { UUID } from "../Common/index.js";
import { CreateEventCommon, EditEventCommon, EventCommon } from "./BaseEvent.js";
import { UNCATEGORIZED } from "./EventType.js";

export const CreateEventBody = t.strict(
  {
    ...CreateEventCommon.type.props,
    type: UNCATEGORIZED,
    payload: t.strict({
      title: t.string,
      actors: t.array(UUID),
      groups: t.array(UUID),
      groupsMembers: t.array(UUID),
      location: optionFromUndefined(UUID),
      endDate: optionFromUndefined(DateFromISOString),
    }),
  },
  "CreateEventBody",
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = t.strict(
  {
    ...EditEventCommon.type.props,
    type: UNCATEGORIZED,
    payload: t.strict({
      title: t.string,
      location: optionFromUndefined(UUID),
      actors: t.array(t.string),
      groups: t.array(t.string),
      groupsMembers: t.array(t.string),
      endDate: optionFromUndefined(DateFromISOString),
    }),
  },
  "EditEventPayload",
);

export type EditEventBody = t.TypeOf<typeof EditEventBody>;

export const UncategorizedV2Payload = t.strict(
  {
    title: t.string,
    location: t.union([UUID, t.undefined]),
    endDate: t.union([DateFromISOString, t.undefined]),
    actors: t.array(UUID),
    groups: t.array(UUID),
    groupsMembers: t.array(UUID),
  },
  "UncategorizedV2Payload",
);

export type UncategorizedV2Payload = t.TypeOf<typeof UncategorizedV2Payload>;

export const Uncategorized = t.strict(
  {
    ...EventCommon.type.props,
    type: UNCATEGORIZED,
    payload: UncategorizedV2Payload,
  },
  "UncategorizedEvent",
);

export type Uncategorized = t.TypeOf<typeof Uncategorized>;

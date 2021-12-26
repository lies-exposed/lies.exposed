import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyRecordFromType } from "../../Common";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { Point, UUID } from "../Common";
import { CreateKeyword } from "../Keyword";
import { CreateLink } from "../Link";
import { MediaType } from "../Media";
import { EditEventCommon, EventCommon } from "./BaseEvent";

export const UncategorizedType = t.literal("Uncategorized");
export type UncategorizedType = t.TypeOf<typeof UncategorizedType>;

export const CreateEventBody = t.strict(
  {
    title: t.string,
    type: UncategorizedType,
    media: optionFromUndefined(
      t.array(
        t.union([
          UUID,
          t.strict({
            location: t.string,
            description: t.string,
            thumbnail: t.union([t.string, t.undefined]),
            type: MediaType,
          }),
        ])
      )
    ),
    links: t.array(t.union([UUID, CreateLink])),
    keywords: t.array(t.union([UUID, CreateKeyword])),
    actors: t.array(UUID),
    groups: t.array(UUID),
    groupsMembers: t.array(UUID),
    date: DateFromISOString,
    endDate: optionFromUndefined(DateFromISOString),
    body: t.UnknownRecord,
    excerpt: t.union([t.UnknownRecord, t.null]),
  },
  "CreateEventBody"
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = nonEmptyRecordFromType(
  {
    ...EditEventCommon.type.props,
    type: UncategorizedType,
    title: optionFromUndefined(t.string),
    location: optionFromUndefined(Point),
    actors: optionFromUndefined(t.array(t.string)),
    groups: optionFromUndefined(t.array(t.string)),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    endDate: optionFromUndefined(DateFromISOString),
    body: optionFromUndefined(t.UnknownRecord),
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

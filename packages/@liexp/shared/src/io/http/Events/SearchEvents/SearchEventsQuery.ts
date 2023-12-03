import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/BooleanFromString";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { NumberFromString } from "io-ts-types/NumberFromString";
import { UUID } from "io-ts-types/UUID";
import { optionFromUndefined } from "../../../Common/optionFromUndefined";
import { GetListQuery } from "../../Query";
import { EventType } from "../EventType";

export const GetSearchEventsQuery = t.strict(
  {
    ...GetListQuery.props,
    ids: optionFromUndefined(t.array(UUID)),
    eventType: optionFromUndefined(t.union([EventType, t.array(EventType)])),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    actors: optionFromUndefined(t.array(UUID)),
    groups: optionFromUndefined(t.array(UUID)),
    links: optionFromUndefined(t.array(UUID)),
    keywords: optionFromUndefined(t.array(UUID)),
    media: optionFromUndefined(t.array(UUID)),
    locations: optionFromUndefined(t.array(UUID)),
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
    title: optionFromUndefined(t.string),
    exclude: optionFromUndefined(t.array(UUID)),
    withDeleted: optionFromUndefined(BooleanFromString),
    withDrafts: optionFromUndefined(BooleanFromString),
    draft: optionFromUndefined(BooleanFromString),
    emptyKeywords: optionFromUndefined(BooleanFromString),
    emptyActors: optionFromUndefined(BooleanFromString),
    emptyGroups: optionFromUndefined(BooleanFromString),
    emptyMedia: optionFromUndefined(BooleanFromString),
    emptyLinks: optionFromUndefined(BooleanFromString),
    spCount: optionFromUndefined(NumberFromString),
    onlyUnshared: optionFromUndefined(BooleanFromString),
  },
  "GetEventsQueryFilter",
);

export type GetSearchEventsQuery = t.TypeOf<typeof GetSearchEventsQuery>;
export type GetSearchEventsQueryInput = t.OutputOf<typeof GetSearchEventsQuery>;

import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromUndefined } from "../../../Common/optionFromUndefined.js";
import { GetListQuery } from "../../Query/index.js";
import { EventType } from "../EventType.js";

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

import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { GetListQuery } from "../Query";

export const GetSearchEventsQuery = t.strict(
  {
    ...GetListQuery.props,
    ids: optionFromUndefined(t.array(UUID)),
    type: optionFromUndefined(t.union([t.string, t.array(t.string)])),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    actors: optionFromUndefined(t.array(t.string)),
    groups: optionFromUndefined(t.array(t.string)),
    links: optionFromUndefined(t.array(t.string)),
    keywords: optionFromUndefined(t.array(t.string)),
    media: optionFromUndefined(t.array(t.string)),
    locations: optionFromUndefined(t.array(t.string)),
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
    title: optionFromUndefined(t.string),
    exclude: optionFromUndefined(t.array(t.string)),
    withDeleted: optionFromUndefined(BooleanFromString),
    withDrafts: optionFromUndefined(BooleanFromString),
    draft: optionFromUndefined(BooleanFromString),
  },
  "GetEventsQueryFilter"
);

export type GetSearchEventsQuery = t.TypeOf<typeof GetSearchEventsQuery>;
export type GetSearchEventsQueryInput = t.OutputOf<typeof GetSearchEventsQuery>;

export const EventTotals = t.strict(
  {
    uncategorized: t.number,
    deaths: t.number,
    scientificStudies: t.number,
    patents: t.number,
    documentaries: t.number,
    transactions: t.number,
  },
  "EventTotals"
);

export type EventTotals = t.TypeOf<typeof EventTotals>;

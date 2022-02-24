import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { GetListQuery } from "../Query";

export const GetSearchEventsQuery = t.strict(
  {
    ...GetListQuery.props,
    type: optionFromUndefined(t.string),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    actors: optionFromUndefined(t.array(t.string)),
    groups: optionFromUndefined(t.array(t.string)),
    links: optionFromUndefined(t.array(t.string)),
    keywords: optionFromUndefined(t.array(t.string)),
    media: optionFromUndefined(t.array(t.string)),
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
    title: optionFromUndefined(t.string),
    withDeleted: optionFromUndefined(BooleanFromString),
    withDrafts: optionFromUndefined(BooleanFromString)
  },
  "GetEventsQueryFilter"
);

export type GetSearchEventsQuery = t.TypeOf<typeof GetSearchEventsQuery>;
export type GetSearchEventsQueryInput = t.OutputOf<typeof GetSearchEventsQuery>
import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../../Common/optionFromUndefined";
import { GetListQuery } from "../Query";
import { DeathType } from "./Death";
import { ScientificStudyType } from "./ScientificStudy";
import { UncategorizedType } from "./Uncategorized";

export const SearchEventsQuery = t.strict(
  {
    ...GetListQuery.props,
    type: optionFromNullable(
      t.union([DeathType, ScientificStudyType, UncategorizedType])
    ),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    actors: optionFromUndefined(t.array(t.string)),
    groups: optionFromUndefined(t.array(t.string)),
    links: optionFromUndefined(t.array(t.string)),
    keywords: optionFromUndefined(t.array(t.string)),
    media: optionFromUndefined(t.array(t.string)),
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
    title: optionFromUndefined(t.string),
  },
  "GetEventsQueryFilter"
);

export type SearchEventsQuery = t.TypeOf<typeof SearchEventsQuery>;

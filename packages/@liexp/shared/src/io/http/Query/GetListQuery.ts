import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromUndefined } from "../../Common/optionFromUndefined.js";
import { PaginationQuery } from "./PaginationQuery.js";
import { SortQuery } from "./SortQuery.js";

export const GetListQuery = t.type(
  {
    search: optionFromUndefined(t.string),
    ...SortQuery.props,
    ...PaginationQuery.props,
  },
  "GetListQuery",
);

export type GetListQuery = t.TypeOf<typeof GetListQuery>;

export const GetListQueryActors = t.type({
  actors: optionFromUndefined(t.array(UUID)),
});
export type GetListQueryActors = t.TypeOf<typeof GetListQueryActors>;

export const GetListQueryGroups = t.type(
  {
    groups: optionFromUndefined(t.array(UUID)),
  },
  "GetListQueryGroups",
);
export type GetListQueryGroups = t.TypeOf<typeof GetListQueryGroups>;

export const GetListQueryKeywords = t.type(
  {
    keywords: optionFromUndefined(t.array(UUID)),
  },
  "GetListQueryKeywords",
);
export type GetListQueryKeywords = t.TypeOf<typeof GetListQueryKeywords>;

export const GetListQueryLinks = t.type(
  {
    links: optionFromUndefined(t.array(UUID)),
  },
  "GetListQueryLinks",
);
export type GetListQueryLinks = t.TypeOf<typeof GetListQueryLinks>;

export const GetListQueryMedia = t.type(
  {
    media: optionFromUndefined(t.array(UUID)),
  },
  "GetListQueryMedia",
);

export type GetListQueryMedia = t.TypeOf<typeof GetListQueryMedia>;

export const GetListQueryLocations = t.type(
  {
    locations: optionFromUndefined(t.array(UUID)),
  },
  "GetListQueryLocations",
);

export type GetListQueryLocations = t.TypeOf<typeof GetListQueryLocations>;

export const GetListQueryEvents = t.type(
  {
    events: optionFromUndefined(t.array(UUID)),
  },
  "GetListQueryEvents",
);
export type GetListQueryEvents = t.TypeOf<typeof GetListQueryEvents>;

export const GetListQueryDateRange = t.type(
  {
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
  },
  "GetListQueryDateRange",
);
export type GetListQueryDateRange = t.TypeOf<typeof GetListQueryDateRange>;

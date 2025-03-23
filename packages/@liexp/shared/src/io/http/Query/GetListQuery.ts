import { Schema } from "effect";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull.js";
import { UUID } from "../Common/UUID.js";
import { PaginationQuery } from "./PaginationQuery.js";
import { SortQuery } from "./SortQuery.js";

export const GetListQuery = Schema.Struct({
  ...SortQuery.fields,
  ...PaginationQuery.fields,
  q: OptionFromNullishToNull(Schema.String),
}).annotations({ title: "GetListQuery" });

export type GetListQuery = typeof GetListQuery.Type;

export const GetListQueryActors = Schema.Struct({
  actors: OptionFromNullishToNull(Schema.Array(UUID)),
});
export type GetListQueryActors = typeof GetListQueryActors.Type;

export const GetListQueryAreas = Schema.Struct({
  areas: OptionFromNullishToNull(Schema.Array(UUID)),
});
export type GetListQueryAreas = typeof GetListQueryAreas.Type;

export const GetListQueryGroups = Schema.Struct({
  groups: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({ title: "GetListQueryGroups" });
export type GetListQueryGroups = typeof GetListQueryGroups.Type;

export const GetListQueryKeywords = Schema.Struct({
  keywords: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({
  title: "GetListQueryKeywords",
});
export type GetListQueryKeywords = typeof GetListQueryKeywords.Type;

export const GetListQueryLinks = Schema.Struct({
  links: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({
  title: "GetListQueryLinks",
});
export type GetListQueryLinks = typeof GetListQueryLinks.Type;

export const GetListQueryMedia = Schema.Struct({
  media: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({
  title: "GetListQueryMedia",
});

export type GetListQueryMedia = typeof GetListQueryMedia.Type;

export const GetListQueryLocations = Schema.Struct({
  locations: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({ title: "GetListQueryLocations" });

export type GetListQueryLocations = typeof GetListQueryLocations.Type;

export const GetListQueryEvents = Schema.Struct({
  events: OptionFromNullishToNull(Schema.Array(UUID)),
}).annotations({ title: "GetListQueryEvents" });
export type GetListQueryEvents = typeof GetListQueryEvents.Type;

export const GetListQueryDateRange = Schema.Struct({
  startDate: OptionFromNullishToNull(Schema.Date),
  endDate: OptionFromNullishToNull(Schema.Date),
}).annotations({ title: "GetListQueryDateRange" });
export type GetListQueryDateRange = typeof GetListQueryDateRange.Type;

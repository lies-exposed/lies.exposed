import { fp } from "@liexp/core/lib/fp/index.js";
import { Schema } from "effect";
import { type Monoid } from "fp-ts/lib/Monoid.js";
import { OptionFromNullishToNull } from "../Common/OptionFromNullishToNull.js";
import { URL } from "../Common/URL.js";
import { UUID } from "../Common/UUID.js";
import {
  GetListQueryDateRange,
  GetListQuery,
  GetListQueryEvents,
  GetListQueryKeywords,
  GetListQueryLocations,
  GetListQueryAreas,
} from "../Query/index.js";
import { MediaExtra } from "./MediaExtra.js";
import { type ImageType, MediaType } from "./MediaType.js";

export const MEDIA = Schema.Literal("media");
export type MEDIA = typeof MEDIA.Type;

export const GetListMediaQuery = Schema.Struct({
  ...GetListQuery.fields,
  ...GetListQueryDateRange.fields,
  ...GetListQueryKeywords.fields,
  ...GetListQueryEvents.fields,
  ...GetListQueryAreas.fields,
  ...GetListQueryLocations.fields,
  type: OptionFromNullishToNull(
    Schema.Union(Schema.Array(MediaType), Schema.String),
  ),
  location: OptionFromNullishToNull(URL),
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  exclude: OptionFromNullishToNull(Schema.Array(UUID)),
  emptyThumbnail: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyEvents: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyLinks: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyAreas: OptionFromNullishToNull(Schema.BooleanFromString),
  includeDeleted: OptionFromNullishToNull(Schema.BooleanFromString),
  creator: OptionFromNullishToNull(UUID),
  spCount: OptionFromNullishToNull(Schema.NumberFromString),
  onlyUnshared: OptionFromNullishToNull(Schema.BooleanFromString),
  needRegenerateThumbnail: OptionFromNullishToNull(Schema.BooleanFromString),
  hasExtraThumbnailsError: OptionFromNullishToNull(Schema.BooleanFromString),
}).annotations({
  title: "GetListMediaQuery",
});
export type GetListMediaQuery = typeof GetListMediaQuery.Type;

export const GetListMediaQueryMonoid: Monoid<GetListMediaQuery> = {
  empty: {
    type: fp.O.none,
    ids: fp.O.none,
    exclude: fp.O.none,
    creator: fp.O.none,
    events: fp.O.none,
    areas: fp.O.none,
    keywords: fp.O.none,
    locations: fp.O.none,
    q: fp.O.none,
    location: fp.O.none,
    startDate: fp.O.none,
    endDate: fp.O.none,
    emptyThumbnail: fp.O.none,
    emptyEvents: fp.O.none,
    emptyLinks: fp.O.none,
    emptyAreas: fp.O.none,
    includeDeleted: fp.O.none,
    spCount: fp.O.none,
    onlyUnshared: fp.O.none,
    needRegenerateThumbnail: fp.O.none,
    hasExtraThumbnailsError: fp.O.none,
    _sort: fp.O.some("updatedAt"),
    _order: fp.O.some("DESC"),
    _end: fp.O.some(20),
    _start: fp.O.some(0),
  },
  concat: (x, y) => ({ ...x, ...y }),
} as Monoid<GetListMediaQuery>;

export const CreateMedia = Schema.Struct({
  id: Schema.Union(UUID, Schema.Undefined),
  location: URL,
  label: Schema.Union(Schema.String, Schema.Undefined),
  description: Schema.Union(Schema.String, Schema.Undefined),
  thumbnail: Schema.Union(URL, Schema.Undefined),
  extra: Schema.Union(MediaExtra, Schema.Undefined),
  type: MediaType,
  events: Schema.Array(UUID),
  links: Schema.Array(UUID),
  keywords: Schema.Array(UUID),
  areas: Schema.Array(UUID),
}).annotations({
  title: "CreateMedia",
});

export type CreateMedia = typeof CreateMedia.Type;

export const EditMediaBody = Schema.Struct({
  type: MediaType,
  thumbnail: OptionFromNullishToNull(URL),
  location: URL,
  label: Schema.String,
  description: OptionFromNullishToNull(Schema.String),
  extra: OptionFromNullishToNull(MediaExtra),
  links: Schema.Array(UUID),
  events: Schema.Array(UUID),
  keywords: Schema.Array(UUID),
  areas: Schema.Array(UUID),
  creator: OptionFromNullishToNull(UUID),
  overrideThumbnail: OptionFromNullishToNull(Schema.Boolean),
  overrideExtra: OptionFromNullishToNull(Schema.Boolean),
  transfer: OptionFromNullishToNull(Schema.Boolean),
  transferThumbnail: OptionFromNullishToNull(Schema.Boolean),
  restore: OptionFromNullishToNull(Schema.Boolean),
}).annotations({
  title: "EditMediaBody",
});
export type EditMediaBody = typeof EditMediaBody.Type;

export const Media = Schema.Struct({
  ...CreateMedia.fields,
  id: UUID,
  type: MediaType,
  label: Schema.String,
  creator: Schema.Union(UUID, Schema.Undefined),
  featuredInStories: Schema.Union(Schema.Array(UUID), Schema.Undefined),
  socialPosts: Schema.Union(Schema.Array(UUID), Schema.Undefined),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.Union(Schema.Date, Schema.Undefined),
}).annotations({
  title: "Media",
});
export type Media = typeof Media.Type;

export type ImageMedia = Omit<Media, "type"> & { type: ImageType };

export const AdminMedia = Schema.Struct({
  ...Media.fields,
  transferable: Schema.Boolean,
}).annotations({
  title: "AdminMedia",
});
export type AdminMedia = typeof AdminMedia.Type;

import { fp } from "@liexp/core/lib/fp/index.js";
import { type Monoid } from "fp-ts/lib/Monoid.js";
import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
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

export const MEDIA = t.literal("media");
export type MEDIA = t.TypeOf<typeof MEDIA>;

export const GetListMediaQuery = t.type(
  {
    ...GetListQuery.props,
    ...GetListQueryDateRange.props,
    ...GetListQueryKeywords.props,
    ...GetListQueryEvents.props,
    ...GetListQueryAreas.props,
    ...GetListQueryLocations.props,
    type: optionFromNullable(t.union([t.array(MediaType), t.string])),
    ids: optionFromNullable(t.array(UUID)),
    exclude: optionFromNullable(t.array(UUID)),
    emptyThumbnail: optionFromNullable(BooleanFromString),
    emptyEvents: optionFromNullable(BooleanFromString),
    emptyLinks: optionFromNullable(BooleanFromString),
    emptyAreas: optionFromNullable(BooleanFromString),
    includeDeleted: optionFromNullable(BooleanFromString),
    creator: optionFromNullable(UUID),
    spCount: optionFromNullable(NumberFromString),
    onlyUnshared: optionFromNullable(BooleanFromString),
    needRegenerateThumbnail: optionFromNullable(BooleanFromString),
    hasExtraThumbnailsError: optionFromNullable(BooleanFromString),
  },
  "MediaListQuery",
);
export type GetListMediaQuery = t.TypeOf<typeof GetListMediaQuery>;

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
    _end: fp.O.some(20 as t.Int),
    _start: fp.O.some(0 as t.Int),
  },
  concat: (x, y) => ({ ...x, ...y }),
};

export const CreateMedia = t.strict(
  {
    location: t.string,
    label: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    thumbnail: t.union([t.string, t.undefined]),
    extra: t.union([MediaExtra, t.undefined]),
    type: MediaType,
    events: t.array(UUID),
    links: t.array(UUID),
    keywords: t.array(UUID),
    areas: t.array(UUID),
  },
  "CreateMedia",
);

export type CreateMedia = t.TypeOf<typeof CreateMedia>;

export const Media = t.strict(
  {
    ...CreateMedia.type.props,
    id: UUID,
    type: MediaType,
    creator: t.union([UUID, t.undefined]),
    featuredInStories: t.union([t.array(UUID), t.undefined]),
    socialPosts: t.union([t.array(UUID), t.undefined]),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined]),
  },
  "Media",
);
export type Media = t.TypeOf<typeof Media>;

export type ImageMedia = Omit<Media, "type"> & { type: ImageType };

export const AdminMedia = t.intersection(
  [Media, t.strict({ transferable: t.boolean })],
  "AdminMedia",
);
export type AdminMedia = t.TypeOf<typeof AdminMedia>;

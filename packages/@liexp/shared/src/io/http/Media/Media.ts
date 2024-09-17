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
  },
  "MediaListQuery",
);
export type GetListMediaQuery = t.TypeOf<typeof GetListMediaQuery>;

export const CreateMedia = t.strict(
  {
    location: t.string,
    label: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    thumbnail: t.union([t.string, t.undefined]),
    extra: MediaExtra,
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

import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { optionFromUndefined } from "../Common/optionFromUndefined.js";
import { URL, UUID } from "./Common/index.js";
import { CreateMedia, MediaType } from "./Media/index.js";
import {
  GetListQuery,
  GetListQueryDateRange,
  GetListQueryEvents,
  GetListQueryKeywords,
} from "./Query/index.js";

export const LINKS = t.literal("links");
export type LINKS = t.TypeOf<typeof LINKS>;

export const GetListLinkQuery = t.type(
  {
    ...GetListQuery.props,
    ...GetListQueryDateRange.props,
    ...GetListQueryKeywords.props,
    ...GetListQueryEvents.props,
    ids: optionFromNullable(t.array(UUID)),
    provider: optionFromNullable(UUID),
    creator: optionFromNullable(UUID),
    url: optionFromNullable(URL),
    noPublishDate: optionFromUndefined(BooleanFromString),
    emptyEvents: optionFromNullable(BooleanFromString),
    onlyDeleted: optionFromNullable(BooleanFromString),
    onlyUnshared: optionFromNullable(BooleanFromString),
  },
  "GetListLinkQuery",
);
export type GetListLinkQuery = t.TypeOf<typeof GetListLinkQuery>;

export const CreateLink = t.strict(
  {
    url: URL,
    publishDate: t.union([DateFromISOString, t.undefined], "PublishDate"),
    description: t.union([t.string, t.undefined]),
    events: t.array(UUID),
  },
  "CreateLink",
);
export type CreateLink = t.TypeOf<typeof CreateLink>;

export const LinkMedia = t.strict(
  {
    id: UUID,
    ...CreateMedia.type.props,
    type: MediaType,
  },
  "LinkMedia",
);
export type LinkMedia = t.TypeOf<typeof LinkMedia>;

export const EditLink = t.strict(
  {
    ...CreateLink.type.props,
    title: t.string,
    description: t.string,
    keywords: t.array(UUID),
    provider: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    creator: optionFromUndefined(UUID),
    image: t.union([LinkMedia, UUID, t.undefined], "LinkImage"),
    overrideThumbnail: optionFromUndefined(t.boolean),
  },
  "EditLinkBody",
);

export type EditLink = t.TypeOf<typeof EditLink>;

const { events, overrideThumbnail, image, ...linkBaseProps } =
  EditLink.type.props;

export const Link = t.strict(
  {
    ...linkBaseProps,
    id: UUID,
    title: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    publishDate: t.union([DateFromISOString, t.undefined]),
    image: t.union([LinkMedia, t.undefined]),
    keywords: t.array(UUID),
    provider: t.union([UUID, t.undefined]),
    creator: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    socialPosts: t.array(UUID),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined]),
  },
  "Link",
);

export type Link = t.TypeOf<typeof Link>;

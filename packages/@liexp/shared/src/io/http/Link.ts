import { Schema } from "effect";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { URL, UUID } from "./Common/index.js";
import { CreateMedia, MediaType } from "./Media/index.js";
import {
  GetListQuery,
  GetListQueryDateRange,
  GetListQueryEvents,
  GetListQueryKeywords,
} from "./Query/index.js";

export const LINKS = Schema.Literal("links");
export type LINKS = typeof LINKS.Type;

export const GetListLinkQuery = Schema.Struct({
  ...GetListQueryDateRange.fields,
  ...GetListQueryKeywords.fields,
  ...GetListQueryEvents.fields,
  ...GetListQuery.fields,
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  provider: OptionFromNullishToNull(UUID),
  creator: OptionFromNullishToNull(UUID),
  url: OptionFromNullishToNull(URL),
  noPublishDate: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyEvents: OptionFromNullishToNull(Schema.BooleanFromString),
  onlyDeleted: OptionFromNullishToNull(Schema.BooleanFromString),
  onlyUnshared: OptionFromNullishToNull(Schema.BooleanFromString),
}).annotations({
  title: "GetListLinkQuery",
});
export type GetListLinkQuery = typeof GetListLinkQuery.Type;

export const CreateLink = Schema.Struct({
  url: URL,
  publishDate: Schema.Union(Schema.Date, Schema.Undefined).annotations({
    title: "PublishDate",
  }),
  description: Schema.Union(Schema.String, Schema.Undefined),
  events: Schema.Array(UUID),
}).annotations({
  title: "CreateLink",
});
export type CreateLink = typeof CreateLink.Type;

export const LinkMedia = Schema.Struct({
  ...CreateMedia.fields,
  id: UUID,
  type: MediaType,
}).annotations({
  title: "LinkMedia",
});
export type LinkMedia = typeof LinkMedia.Type;

export const EditLink = Schema.Struct({
  ...CreateLink.fields,
  title: Schema.String,
  description: Schema.String,
  keywords: Schema.Array(UUID),
  provider: Schema.Union(UUID, Schema.Undefined),
  events: Schema.Array(UUID),
  creator: OptionFromNullishToNull(UUID),
  image: Schema.Union(LinkMedia, UUID, Schema.Undefined).annotations({
    title: "LinkImage",
  }),
  overrideThumbnail: OptionFromNullishToNull(Schema.Boolean),
}).annotations({
  title: "EditLinkBody",
});

export type EditLink = typeof EditLink.Type;

const { events, overrideThumbnail, image, ...linkBaseProps } = EditLink.fields;

export const Link = Schema.Struct({
  ...linkBaseProps,
  id: UUID,
  title: Schema.Union(Schema.String, Schema.Undefined),
  description: Schema.Union(Schema.String, Schema.Undefined),
  publishDate: Schema.Union(Schema.Date, Schema.Undefined),
  image: Schema.Union(LinkMedia, Schema.Undefined, Schema.Null),
  keywords: Schema.Array(UUID),
  provider: Schema.Union(UUID, Schema.Undefined),
  creator: Schema.Union(UUID, Schema.Undefined),
  events: Schema.Array(UUID),
  socialPosts: Schema.Array(UUID),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.Union(Schema.Date, Schema.Undefined),
}).annotations({ title: "Link" });

export type Link = typeof Link.Type;

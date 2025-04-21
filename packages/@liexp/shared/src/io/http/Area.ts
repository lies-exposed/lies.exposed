import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";
import { Geometry } from "./Common/Geometry/index.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { UUID } from "./Common/UUID.js";
import { Media } from "./Media/Media.js";
import { GetListQuery } from "./Query/GetListQuery.js";

export const AREAS = Schema.Literal("areas");
export type AREAS = typeof AREAS.Type;

export const ListAreaQuery = Schema.Struct({
  ...GetListQuery.fields,
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  draft: OptionFromNullishToNull(Schema.BooleanFromString),
  withDeleted: OptionFromNullishToNull(Schema.BooleanFromString),
}).annotations({
  title: "ListAreaQuery",
});

export type ListAreaQuery = typeof ListAreaQuery.Type;

export const CreateAreaBody = Schema.Struct({
  label: Schema.String,
  slug: Schema.String,
  draft: Schema.Boolean,
  geometry: Geometry,
  body: BlockNoteDocument,
}).annotations({
  title: "CreateAreaBody",
});

export type CreateAreaBody = typeof CreateAreaBody.Type;

export const EditAreaBody = Schema.Struct({
  geometry: OptionFromNullishToNull(Geometry),
  label: OptionFromNullishToNull(Schema.String),
  slug: OptionFromNullishToNull(Schema.String),
  draft: OptionFromNullishToNull(Schema.Boolean),
  body: OptionFromNullishToNull(BlockNoteDocument),
  featuredImage: OptionFromNullishToNull(UUID),
  media: Schema.Array(UUID),
  events: OptionFromNullishToNull(Schema.Array(UUID)),
  updateGeometry: OptionFromNullishToNull(Schema.Boolean),
}).annotations({
  title: "EditAreaBody",
});

export type EditAreaBody = typeof EditAreaBody.Type;

export const Area = Schema.Struct({
  ...BaseProps.fields,
  ...CreateAreaBody.fields,
  body: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Null),
  featuredImage: Schema.Union(Media, Schema.Null),
  media: Schema.Array(UUID),
  events: Schema.Array(UUID),
  socialPosts: Schema.Array(UUID),
}).annotations({
  title: "Area",
});

export type Area = typeof Area.Type;

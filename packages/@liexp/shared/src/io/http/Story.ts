import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { UUID } from "./Common/UUID.js";
import { Media } from "./Media/Media.js";
import { OptionFromNullishToNull } from './Common/OptionFromNullishToNull.js';

export const EditStoryBody = Schema.Struct({
  title: Schema.String,
  path: Schema.String,
  draft: Schema.Boolean,
  creator: UUID,
  date: Schema.DateFromString,
  featuredImage: OptionFromNullishToNull(Schema.Struct({ id: UUID })),
  body2: Schema.Unknown,
  keywords: Schema.Array(UUID),
  groups: Schema.Array(UUID),
  actors: Schema.Array(UUID),
  events: Schema.Array(UUID),
  media: Schema.Array(UUID),
}).annotations({
  title: "EditStoryBody",
});
export type EditStoryBody = typeof EditStoryBody.Type;

export const Story = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  path: Schema.String,
  draft: Schema.Boolean,
  creator: Schema.Union(UUID, Schema.Undefined),
  date: Schema.DateFromString,
  featuredImage: Schema.Union(Media, Schema.Undefined),
  body: Schema.String,
  body2: Schema.Union(Schema.Unknown, Schema.Null),
  keywords: Schema.Array(UUID),
  links: Schema.Array(UUID),
  media: Schema.Array(UUID),
  actors: Schema.Array(UUID),
  groups: Schema.Array(UUID),
  events: Schema.Array(UUID),
}).annotations({
  title: "Story",
});

export type Story = typeof Story.Type;

import { Schema } from "effect";
import { BlockNoteDocument } from "../Common/BlockNoteDocument.js";
import { UUID } from "../Common/UUID.js";
import { CreateLink } from "../Link.js";
import { CreateMedia } from "../Media/Media.js";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

const CreateEventLink = CreateLink.omit("events").annotations({
  title: "CreateEventLinkProps",
});

export const CreateEventCommon = Schema.Struct({
  excerpt: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Undefined),
  body: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Undefined),
  date: Schema.DateFromString,
  draft: Schema.Boolean,
  media: Schema.Array(Schema.Union(UUID, CreateMedia)),
  links: Schema.Array(Schema.Union(UUID, CreateEventLink)),
  keywords: Schema.Array(UUID),
}).annotations({
  title: "CreateEventCommon",
});
export type CreateEventCommon = typeof CreateEventCommon.Type;

export const EditEventCommon = Schema.Struct({
  excerpt: OptionFromNullishToNull(BlockNoteDocument),
  body: OptionFromNullishToNull(BlockNoteDocument),
  draft: OptionFromNullishToNull(Schema.Boolean),
  date: OptionFromNullishToNull(Schema.DateFromString),
  keywords: OptionFromNullishToNull(Schema.Array(UUID)),
  media: OptionFromNullishToNull(Schema.Array(Schema.Union(UUID, CreateMedia))),
  links: OptionFromNullishToNull(Schema.Array(Schema.Union(UUID, CreateEventLink))),
}).annotations({
  title: "EditEventCommon",
});
export type EditEventCommon = typeof EditEventCommon.Type;

export const EventCommon = Schema.Struct({
  ...CreateEventCommon.fields,
  id: UUID,
  media: Schema.Array(UUID).annotations({ title: "media" }),
  links: Schema.Array(UUID).annotations({ title: "links" }),
  socialPosts: Schema.Union(Schema.Array(UUID), Schema.Undefined),
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
  deletedAt: Schema.Union(Schema.DateFromString, Schema.Undefined).annotations({
    title: "deletedAt",
  }),
}).annotations({
  title: "EventCommon",
});
export type EventCommon = typeof EventCommon.Type;

import { Schema } from "effect";
import { Actor } from "../../Actor.js";
import * as Group from "../../Group.js";
import * as Link from "../../Link.js";
import * as Media from "../../Media/index.js";
import * as Documentary from "../Documentary.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchDocumentaryEvent = SearchEventCodec(
  Documentary.Documentary.fields,
  {
    media: Media.Media,
    authors: Schema.Struct({
      actors: Schema.Array(Actor),
      groups: Schema.Array(Group.Group),
    }),
    subjects: Schema.Struct({
      actors: Schema.Array(Actor),
      groups: Schema.Array(Group.Group),
    }),
    website: Schema.Union(Link.Link, Schema.Undefined),
  },
);

export type SearchDocumentaryEvent = typeof SearchDocumentaryEvent.Type;

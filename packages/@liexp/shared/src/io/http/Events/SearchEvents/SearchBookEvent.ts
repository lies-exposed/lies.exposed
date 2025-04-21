import { Schema } from "effect";
import { BySubject } from "../../Common/index.js";
import * as Media from "../../Media/Media.js";
import * as Book from "../Book.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchBookEvent = SearchEventCodec(Book.Book.fields, {
  authors: Schema.Array(BySubject),
  publisher: Schema.Union(BySubject, Schema.Undefined),
  media: Schema.Struct({
    pdf: Media.Media,
    audio: Schema.Union(Media.Media, Schema.Undefined),
  }),
});

export type SearchBookEvent = typeof SearchBookEvent.Type;

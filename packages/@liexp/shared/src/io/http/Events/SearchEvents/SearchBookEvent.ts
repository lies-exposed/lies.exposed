import * as t from "io-ts";
import { BySubject } from "../../Common/index.js";
import * as Media from "../../Media/Media.js";
import * as Book from "../Book.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchBookEvent = SearchEventCodec(Book.Book, {
  authors: t.array(BySubject),
  publisher: t.union([BySubject, t.undefined]),
  media: t.strict({
    pdf: Media.Media,
    audio: t.union([Media.Media, t.undefined]),
  }),
});

export type SearchBookEvent = t.TypeOf<typeof SearchBookEvent>;

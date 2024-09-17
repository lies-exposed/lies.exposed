import { type BySubject } from "../../Common/index.js";
import type * as Keyword from "../../Keyword.js";
import type * as Link from "../../Link.js";
import type * as Media from "../../Media/Media.js";
import type * as Book from "../Book.js";

export interface SearchBookEvent
  extends Omit<Book.Book, "payload" | "media" | "keywords" | "links"> {
  payload: Omit<Book.Book["payload"], "authors" | "publisher" | "media"> & {
    authors: BySubject[];
    publisher?: BySubject;
    media: { pdf: Media.Media; audio?: Media.Media };
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

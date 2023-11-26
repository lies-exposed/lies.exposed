import { type BySubject } from "../../Common";
import type * as Keyword from "../../Keyword";
import type * as Link from "../../Link";
import type * as Media from "../../Media";
import type * as Book from "../Book";


export interface SearchBookEvent
  extends Omit<Book.Book, "payload" | "media" | "keywords" | "links"> {
  payload: Omit<Book.Book["payload"], "authors" | "publisher" | 'media'> & {
    authors: BySubject[];
    publisher?: BySubject;
    media: { pdf: Media.Media; audio?: Media.Media; };
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

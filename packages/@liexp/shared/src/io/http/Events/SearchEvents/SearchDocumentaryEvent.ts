import * as t from "io-ts";
import { Actor } from "../../Actor.js";
import * as Group from "../../Group.js";
import * as Link from "../../Link.js";
import * as Media from "../../Media/index.js";
import * as Documentary from "../Documentary.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchDocumentaryEvent = SearchEventCodec(
  Documentary.Documentary,
  {
    media: Media.Media,
    authors: t.strict({
      actors: t.array(Actor),
      groups: t.array(Group.Group),
    }),
    subjects: t.strict({
      actors: t.array(Actor),
      groups: t.array(Group.Group),
    }),
    website: Link.Link,
  },
);

export type SearchDocumentaryEvent = t.TypeOf<typeof SearchDocumentaryEvent>;

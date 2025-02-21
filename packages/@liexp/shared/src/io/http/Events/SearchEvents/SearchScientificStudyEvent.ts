import * as t from "io-ts";
import * as Actor from "../../Actor.js";
import * as Group from "../../Group.js";
import * as Link from "../../Link.js";
import * as ScientificStudy from "../ScientificStudy.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchScientificStudyEvent = SearchEventCodec(
  ScientificStudy.ScientificStudy,
  {
    authors: t.array(Actor.Actor),
    publisher: t.union([Group.Group, t.undefined]),
    url: Link.Link,
  },
);

export type SearchScientificStudyEvent = t.TypeOf<
  typeof SearchScientificStudyEvent
>;

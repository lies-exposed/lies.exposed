import { Schema } from "effect";
import * as Actor from "../../Actor.js";
import * as Group from "../../Group.js";
import * as Link from "../../Link.js";
import * as ScientificStudy from "../ScientificStudy.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchScientificStudyEvent = SearchEventCodec(
  ScientificStudy.ScientificStudy.fields,
  {
    authors: Schema.Array(Actor.Actor),
    publisher: Schema.Union(Group.Group, Schema.Undefined),
    url: Schema.Union(Link.Link, Schema.Undefined),
  },
);

export type SearchScientificStudyEvent = typeof SearchScientificStudyEvent.Type;

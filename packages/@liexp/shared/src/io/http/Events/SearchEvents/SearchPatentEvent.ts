import { Schema } from "effect";
import * as Actor from "../../Actor.js";
import * as Group from "../../Group.js";
import * as Link from "../../Link.js";
import * as Patent from "../Patent.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchPatentEvent = SearchEventCodec(Patent.Patent.fields, {
  source: Schema.Union(Link.Link, Schema.Undefined),
  owners: Schema.Struct({
    actors: Schema.Array(Actor.Actor),
    groups: Schema.Array(Group.Group),
  }),
});

export type SearchPatentEvent = typeof SearchPatentEvent.Type;

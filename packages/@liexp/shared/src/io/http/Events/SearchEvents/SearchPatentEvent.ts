import * as t from "io-ts";
import * as Actor from "../../Actor.js";
import * as Group from "../../Group.js";
import * as Link from "../../Link.js";
import * as Patent from "../Patent.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchPatentEvent = SearchEventCodec(Patent.Patent, {
  source: Link.Link,
  owners: t.strict({
    actors: t.array(Actor.Actor),
    groups: t.array(Group.Group),
  }),
});

export type SearchPatentEvent = t.TypeOf<typeof SearchPatentEvent>;

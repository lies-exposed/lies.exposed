import { Schema } from "effect";
import * as Actor from "../../Actor.js";
import * as Group from "../../Group.js";
import * as GroupMember from "../../GroupMember.js";
import * as Uncategorized from "../Uncategorized.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchUncategorizedEvent = SearchEventCodec(
  Uncategorized.Uncategorized.fields,
  {
    actors: Schema.Array(Actor.Actor),
    groups: Schema.Array(Group.Group),
    groupsMembers: Schema.Array(GroupMember.GroupMember),
  },
);

export type SearchUncategorizedEvent = typeof SearchUncategorizedEvent.Type;

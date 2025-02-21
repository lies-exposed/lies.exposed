import * as t from "io-ts";
import * as Actor from "../../Actor.js";
import * as Group from "../../Group.js";
import * as GroupMember from "../../GroupMember.js";
import * as Uncategorized from "../Uncategorized.js";
import { SearchEventCodec } from "./SearchEventCodec.js";

export const SearchUncategorizedEvent = SearchEventCodec(
  Uncategorized.Uncategorized,
  {
    actors: t.array(Actor.Actor),
    groups: t.array(Group.Group),
    groupsMembers: t.array(GroupMember.GroupMember),
  },
);

export type SearchUncategorizedEvent = t.TypeOf<
  typeof SearchUncategorizedEvent
>;

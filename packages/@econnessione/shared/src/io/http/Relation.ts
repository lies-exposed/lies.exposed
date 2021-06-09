import * as t from "io-ts";
import { ActorFrontmatter } from "./Actor";
import { GroupFrontmatter, GroupFrontmatterC } from "./Group";

export const GroupRelation = t.strict(
  {
    type: t.literal("Group"),
    group: GroupFrontmatter as any as t.ExactC<t.TypeC<GroupFrontmatterC>>,
  },
  "GroupRelation"
);
export interface GroupRelation {
  type: "Group";
  group: GroupFrontmatter;
}

export const ActorRelation = t.strict(
  {
    type: t.literal("Actor"),
    actor: ActorFrontmatter,
  },
  "ByActor"
);
export type ActorRelation = t.TypeOf<typeof ActorRelation>;

export const Relation = t.union([GroupRelation, ActorRelation], "Relation");
export type Relation = GroupRelation | ActorRelation;

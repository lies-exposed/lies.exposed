import { type UUID } from "io-ts-types/lib/UUID";
import {
    type Actor,
    type Group,
    type GroupMember,
    type Keyword,
    type Media,
  } from "../../io/http";

export interface EventRelationIds {
  actors: UUID[];
  groups: UUID[];
  groupsMembers: UUID[];
  keywords: UUID[];
  media: UUID[];
  // links: string[]
}

export interface EventRelations {
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  media: Media.Media[];
}

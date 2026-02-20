import * as GroupMember from "@liexp/io/lib/http/GroupMember.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { ActorArb } from "./Actor.arbitrary.js";
import { GroupArb } from "./Group.arbitrary.js";
import { BlockNoteDocumentArb } from "./common/BlockNoteDocument.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const groupMemberProps = GroupMember.GroupMember.omit(
  "id",
  "body",
  "excerpt",
  "actor",
  "group",
  "startDate",
  "endDate",
  "body",
  "endDate",
  "createdAt",
  "updatedAt",
  "deletedAt",
);

export const GroupMemberArb: fc.Arbitrary<GroupMember.GroupMember> =
  Arbitrary.make(groupMemberProps).map((p) => ({
    ...p,
    id: fc.sample(UUIDArb, 1)[0],
    startDate: new Date(),
    endDate: new Date(),
    actor: fc.sample(ActorArb, 1)[0],
    group: fc.sample(GroupArb, 1)[0],
    excerpt: fc.sample(BlockNoteDocumentArb(), 1)[0],
    body: fc.sample(BlockNoteDocumentArb(), 1)[0],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }));

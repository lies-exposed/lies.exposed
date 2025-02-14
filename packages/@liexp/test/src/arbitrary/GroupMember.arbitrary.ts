import { propsOmit } from "@liexp/core/lib/io/utils.js";
import { type GroupMember } from "@liexp/shared/lib/io/http/GroupMember.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
import { ActorArb } from "./Actor.arbitrary.js";
import { GroupArb } from "./Group.arbitrary.js";
import { BlockNoteDocumentArb } from "./common/BlockNoteDocument.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const groupMemberProps = propsOmit(http.GroupMember.GroupMember, [
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
]);

export const GroupMemberArb: fc.Arbitrary<GroupMember> = getArbitrary(
  t.strict({ ...groupMemberProps }, "GroupMember"),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  startDate: new Date(),
  endDate: new Date(),
  actor: fc.sample(ActorArb, 1)[0],
  group: fc.sample(GroupArb, 1)[0],
  excerpt: fc.sample(BlockNoteDocumentArb, 1)[0],
  body: fc.sample(BlockNoteDocumentArb, 1)[0],
  events: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: undefined,
}));

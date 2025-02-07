import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import { type GroupMember } from "../../io/http/GroupMember.js";
import * as http from "../../io/http/index.js";
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

export const GroupMemberArb: tests.fc.Arbitrary<GroupMember> = tests
  .getArbitrary(t.strict({ ...groupMemberProps }, "GroupMember"))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(UUIDArb, 1)[0],
    startDate: new Date(),
    endDate: new Date(),
    actor: tests.fc.sample(ActorArb, 1)[0],
    group: tests.fc.sample(GroupArb, 1)[0],
    excerpt: tests.fc.sample(BlockNoteDocumentArb, 1)[0],
    body: tests.fc.sample(BlockNoteDocumentArb, 1)[0],
    events: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined,
  }));

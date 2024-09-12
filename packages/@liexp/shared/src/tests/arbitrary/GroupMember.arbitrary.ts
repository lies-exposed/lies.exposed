import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
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

export const GroupMemberArb = tests
  .getArbitrary(t.strict({ ...groupMemberProps }, "GroupMember"))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(UUIDArb, 1)[0],
    startDate: new Date(),
    endDate: new Date(),
    actor: tests.fc.sample(UUIDArb, 1)[0],
    group: tests.fc.sample(UUIDArb, 1)[0],
    excerpt: {},
    body: {},
    events: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: undefined,
  }));

import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";

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
]);

export const GroupMemberArb: tests.fc.Arbitrary<http.GroupMember.GroupMember> =
  tests
    .getArbitrary(t.strict({ ...groupMemberProps }, "GroupMember"))
    .map((p) => ({
      ...p,
      id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      startDate: new Date(),
      endDate: new Date(),
      actor: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      group: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      excerpt: {},
      body: {},
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

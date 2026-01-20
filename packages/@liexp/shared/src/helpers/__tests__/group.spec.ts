import { type Group } from "@liexp/io/lib/http/index.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import fc from "fast-check";
import { describe, expect, test } from "vitest";
import { getGroups } from "../group.js";

describe("@helpers/group", () => {
  const group: Group.Group = fc.sample(GroupArb, 1)[0];

  test("getGroups returns correct groups", () => {
    expect(getGroups([group])([group.id]).length).toBe(1);
    expect(getGroups([group])(["not-exist"]).length).toBe(0);
  });
});

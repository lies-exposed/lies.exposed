import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import fc from "fast-check";
import { describe, test, expect } from "vitest";
import {
  getActors,
  isByActor,
  isByGroup,
  getUsernameFromDisplayName,
} from "../actor.js";

describe("@helpers/actor", () => {
  test("getActors returns correct actors", () => {
    fc.assert(
      fc.property(ActorArb, (actor) => {
        expect(getActors([actor])([actor.id]).length).toBe(1);
        expect(getActors([actor])(["not-exist"]).length).toBe(0);
      }),
    );
  });

  test("isByActor returns true for matching actor", () => {
    fc.assert(
      fc.property(ActorArb, (actor) => {
        expect(isByActor(actor)({ type: "Actor", id: actor.id })).toBe(true);
        expect(isByActor(actor)({ type: "Actor", id: uuid() })).toBe(false);
        expect(isByActor(actor)({ type: "Group", id: actor.id })).toBe(false);
      }),
    );
  });

  test("isByGroup returns true for matching group", () => {
    fc.assert(
      fc.property(GroupArb, (group) => {
        expect(isByGroup(group)({ type: "Group", id: group.id })).toBe(true);
        expect(isByGroup(group)({ type: "Group", id: uuid() })).toBe(false);
        expect(isByGroup(group)({ type: "Actor", id: group.id })).toBe(false);
      }),
    );
  });

  test("getUsernameFromDisplayName returns kebab-case", () => {
    expect(getUsernameFromDisplayName("John_Doe")).toBe("john-doe");
    expect(getUsernameFromDisplayName("Jane Doe")).toBe("jane-doe");
  });
});

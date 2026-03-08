import { DeathEventArb } from "@liexp/test/lib/arbitrary/events/DeathEvent.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { DeathIO } from "../death.io.js";

const toEventEntity = (event: any) => ({
  ...event,
  date: new Date(event.date),
  createdAt: new Date(event.createdAt),
  updatedAt: new Date(event.updatedAt),
  deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
  socialPosts: [],
  actors: [],
  groups: [],
  location: null,
  draft: false,
  stories: [],
});

describe("DeathIO", () => {
  describe("decodeSingle", () => {
    it("should decode a death event entity to Death HTTP type", () => {
      const event = fc.sample(DeathEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DeathIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve death event id in decoded result", () => {
      const event = fc.sample(DeathEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DeathIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(event.id);
      }
    });

    it("should decode death event with type Death", () => {
      const event = fc.sample(DeathEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DeathIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Death");
      }
    });

    it("should include the victim UUID in the decoded result", () => {
      const event = fc.sample(DeathEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DeathIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        // The Death schema stores victim in payload.victim
        expect(result.right.payload.victim).toBe(event.payload.victim);
      }
    });

    it("should decode multiple death events via decodeMany", () => {
      const events = fc.sample(DeathEventArb, 3).map(toEventEntity);
      const result = DeathIO.decodeMany(events);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(DeathEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DeathIO.encodeSingle(entity as any);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

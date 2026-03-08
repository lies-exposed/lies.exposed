import { ScientificStudyArb } from "@liexp/test/lib/arbitrary/events/ScientificStudy.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { ScientificStudyIO } from "../scientific-study.io.js";

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

describe("ScientificStudyIO", () => {
  describe("decodeSingle", () => {
    it("should decode a scientific study event entity to ScientificStudy HTTP type", () => {
      const event = fc.sample(ScientificStudyArb, 1)[0];
      const entity = toEventEntity(event);
      const result = ScientificStudyIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve scientific study event id in decoded result", () => {
      const event = fc.sample(ScientificStudyArb, 1)[0];
      const entity = toEventEntity(event);
      const result = ScientificStudyIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(event.id);
      }
    });

    it("should decode scientific study event with type ScientificStudy", () => {
      const event = fc.sample(ScientificStudyArb, 1)[0];
      const entity = toEventEntity(event);
      const result = ScientificStudyIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("ScientificStudy");
      }
    });

    it("should decode multiple scientific study events via decodeMany", () => {
      const events = fc.sample(ScientificStudyArb, 3).map(toEventEntity);
      const result = ScientificStudyIO.decodeMany(events);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should decode scientific study event with null excerpt", () => {
      const event = fc.sample(ScientificStudyArb, 1)[0];
      const entity = {
        ...toEventEntity(event),
        excerpt: null,
        body: null,
      };
      const result = ScientificStudyIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(ScientificStudyArb, 1)[0];
      const entity = toEventEntity(event);
      const result = ScientificStudyIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

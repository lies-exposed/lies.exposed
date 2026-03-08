import { BookEventArb } from "@liexp/test/lib/arbitrary/events/BookEvent.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { BookIO } from "../book.io.js";

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

describe("BookIO", () => {
  describe("decodeSingle", () => {
    it("should decode a book event entity to Book HTTP type", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = BookIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve book event id in decoded result", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = BookIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(event.id);
      }
    });

    it("should decode a book event with type Book", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = BookIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Book");
      }
    });

    it("should decode multiple book events via decodeMany", () => {
      const events = fc.sample(BookEventArb, 3).map(toEventEntity);
      const result = BookIO.decodeMany(events);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should decode book event with null excerpt", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = {
        ...toEventEntity(event),
        excerpt: null,
        body: null,
      };
      const result = BookIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = BookIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

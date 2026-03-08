import { BookEventArb } from "@liexp/test/lib/arbitrary/events/BookEvent.arbitrary.js";
import { DeathEventArb } from "@liexp/test/lib/arbitrary/events/DeathEvent.arbitrary.js";
import { DocumentaryEventArb } from "@liexp/test/lib/arbitrary/events/DocumentaryEvent.arbitrary.js";
import { QuoteEventArb } from "@liexp/test/lib/arbitrary/events/QuoteEvent.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { EventV2IO } from "../eventV2.io.js";

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

describe("EventV2IO", () => {
  describe("decodeSingle - Book event", () => {
    it("should decode a Book event entity", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should produce type Book for book entity", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Book");
      }
    });
  });

  describe("decodeSingle - Documentary event", () => {
    it("should decode a Documentary event entity", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should produce type Documentary for documentary entity", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Documentary");
      }
    });
  });

  describe("decodeSingle - Quote event", () => {
    it("should decode a Quote event entity", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should produce type Quote for quote entity", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Quote");
      }
    });
  });

  describe("decodeSingle - Death event", () => {
    it("should decode a Death event entity using the fallback path", () => {
      const event = fc.sample(DeathEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("decodeSingle - Uncategorized event", () => {
    it("should decode an Uncategorized event entity", () => {
      const event = fc.sample(UncategorizedArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should produce type Uncategorized for uncategorized entity", () => {
      const event = fc.sample(UncategorizedArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Uncategorized");
      }
    });
  });

  describe("decodeMany", () => {
    it("should decode an array of mixed event types", () => {
      const bookEvent = toEventEntity(fc.sample(BookEventArb, 1)[0]);
      const deathEvent = toEventEntity(fc.sample(DeathEventArb, 1)[0]);
      const uncatEvent = toEventEntity(fc.sample(UncategorizedArb, 1)[0]);
      const result = EventV2IO.decodeMany([bookEvent, deathEvent, uncatEvent]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(BookEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = EventV2IO.encodeSingle(entity as any);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

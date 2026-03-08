import { QuoteEventArb } from "@liexp/test/lib/arbitrary/events/QuoteEvent.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { QuoteIO } from "../quote.io.js";

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

describe("QuoteIO", () => {
  describe("decodeSingle", () => {
    it("should decode a quote event entity to Quote HTTP type", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = QuoteIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve quote event id in decoded result", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = QuoteIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(event.id);
      }
    });

    it("should decode quote event with type Quote", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = QuoteIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Quote");
      }
    });

    it("should decode multiple quote events via decodeMany", () => {
      const events = fc.sample(QuoteEventArb, 3).map(toEventEntity);
      const result = QuoteIO.decodeMany(events);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should decode quote event with null excerpt and body", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = {
        ...toEventEntity(event),
        excerpt: null,
        body: null,
      };
      const result = QuoteIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(QuoteEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = QuoteIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

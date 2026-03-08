import { TransactionEventArb } from "@liexp/test/lib/arbitrary/events/TransactionEvent.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { TransactionIO } from "../transaction.io.js";

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

describe("TransactionIO", () => {
  describe("decodeSingle", () => {
    it("should decode a transaction event entity to Transaction HTTP type", () => {
      const event = fc.sample(TransactionEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = TransactionIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve transaction event id in decoded result", () => {
      const event = fc.sample(TransactionEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = TransactionIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(event.id);
      }
    });

    it("should decode transaction event with type Transaction", () => {
      const event = fc.sample(TransactionEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = TransactionIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Transaction");
      }
    });

    it("should decode multiple transaction events via decodeMany", () => {
      const events = fc.sample(TransactionEventArb, 3).map(toEventEntity);
      const result = TransactionIO.decodeMany(events);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });

    it("should decode transaction event with null excerpt and body", () => {
      const event = fc.sample(TransactionEventArb, 1)[0];
      const entity = {
        ...toEventEntity(event),
        excerpt: null,
        body: null,
      };
      const result = TransactionIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(TransactionEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = TransactionIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

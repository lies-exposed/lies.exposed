import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { QueueIO } from "../queue.io.js";

const makeQueueEntity = (overrides: Record<string, unknown> = {}) => ({
  id: uuid(),
  type: "openai-create-event-from-url" as const,
  resource: "events" as const,
  status: "pending" as const,
  prompt: null,
  data: {
    url: "https://example.com/article",
    type: "Uncategorized" as const,
    date: undefined,
  },
  result: null,
  error: null,
  // QueueIO uses Schema.validateEither which expects Date objects (not ISO strings)
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

describe("QueueIO", () => {
  describe("decodeSingle", () => {
    it("should decode a valid queue entity", () => {
      const entity = makeQueueEntity();
      const result = QueueIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve the queue id in the decoded result", () => {
      const id = uuid();
      const entity = makeQueueEntity({ id });
      const result = QueueIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(id);
      }
    });

    it("should decode a queue with status processing", () => {
      const entity = makeQueueEntity({ status: "processing" });
      const result = QueueIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode a queue with status done", () => {
      const entity = makeQueueEntity({ status: "done", result: "some result" });
      const result = QueueIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode a queue with status failed", () => {
      const entity = makeQueueEntity({
        status: "failed",
        error: { message: "Something went wrong" },
      });
      const result = QueueIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should return Left for invalid queue data", () => {
      const entity = {
        id: uuid(),
        type: "invalid-type",
        resource: "events",
        status: "pending",
        prompt: null,
        data: {},
        result: null,
        error: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };
      const result = QueueIO.decodeSingle(entity as any);
      expect(E.isLeft(result)).toBe(true);
    });

    it("should decode multiple queue entities via decodeMany", () => {
      const entities = [makeQueueEntity(), makeQueueEntity()];
      const result = QueueIO.decodeMany(entities as any);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(2);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const entity = makeQueueEntity();
      const result = QueueIO.encodeSingle(entity as any);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});

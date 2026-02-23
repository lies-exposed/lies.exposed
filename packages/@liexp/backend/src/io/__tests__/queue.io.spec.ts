import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { QueueIO, toQueueIO } from "../queue.io.js";

const validQueueEntity = {
  id: "00000000-0000-0000-0000-000000000001",
  type: "openai-embedding",
  resource: "actors",
  status: "pending",
  prompt: null,
  data: { url: "https://example.com" },
  result: null,
  error: null,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: null,
};

describe("toQueueIO", () => {
  it("decodes a valid QueueEntity with Date objects", () => {
    const result = toQueueIO(validQueueEntity);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.id).toBe(validQueueEntity.id);
      expect(result.right.type).toBe("openai-embedding");
      expect(result.right.status).toBe("pending");
    }
  });

  it("preserves createdAt and updatedAt as Date objects", () => {
    const result = toQueueIO(validQueueEntity);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right.createdAt).toBeInstanceOf(Date);
      expect(result.right.updatedAt).toBeInstanceOf(Date);
    }
  });

  it("handles null deletedAt", () => {
    const result = toQueueIO({ ...validQueueEntity, deletedAt: null });

    expect(E.isRight(result)).toBe(true);
  });

  it("returns Left when required field is missing", () => {
    const { id: _id, ...withoutId } = validQueueEntity;
    const result = toQueueIO(withoutId as any);

    expect(E.isLeft(result)).toBe(true);
  });

  it("returns Left when status is invalid", () => {
    const result = toQueueIO({ ...validQueueEntity, status: "invalid-status" });

    expect(E.isLeft(result)).toBe(true);
  });
});

describe("QueueIO.decodeSingle", () => {
  it("delegates to toQueueIO", () => {
    const result = QueueIO.decodeSingle(validQueueEntity);

    expect(E.isRight(result)).toBe(true);
  });
});

describe("QueueIO.decodeMany", () => {
  it("decodes an array of QueueEntities", () => {
    const entities = [
      validQueueEntity,
      { ...validQueueEntity, id: "00000000-0000-0000-0000-000000000002" },
    ];
    const result = QueueIO.decodeMany(entities);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toHaveLength(2);
    }
  });

  it("returns Left if any entity fails decoding", () => {
    const entities = [
      validQueueEntity,
      { ...validQueueEntity, status: "bad" },
    ];
    const result = QueueIO.decodeMany(entities);

    expect(E.isLeft(result)).toBe(true);
  });
});

describe("QueueIO.encodeSingle", () => {
  it("returns Left (not implemented)", () => {
    const result = QueueIO.encodeSingle({} as any);

    expect(E.isLeft(result)).toBe(true);
  });
});

import { Readable, Writable } from "stream";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { taskifyStream } from "./task.utils.js";

describe("taskifyStream", () => {
  it("should resolve when stream finishes successfully", async () => {
    const from = Readable.from(["hello", " ", "world"]);
    const chunks: string[] = [];
    const to = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk.toString());
        cb();
      },
    });

    const result = await taskifyStream(from, to)();
    expect(E.isRight(result)).toBe(true);
    expect(chunks.join("")).toBe("hello world");
  });

  it("should return Right with void value on success", async () => {
    const from = Readable.from(["test data"]);
    const to = new Writable({
      write(_chunk, _enc, cb) {
        cb();
      },
    });

    const result = await taskifyStream(from, to)();
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBeUndefined();
    }
  });

  it("should reject when write stream emits an error", async () => {
    const from = Readable.from(["data"]);
    const to = new Writable({
      write(_chunk, _enc, cb) {
        cb(new Error("write error"));
      },
    });

    const result = await taskifyStream(from, to)();
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left).toBeInstanceOf(Error);
      expect(result.left.message).toBe("write error");
    }
  });

  it("should handle empty readable stream", async () => {
    const from = Readable.from([]);
    const to = new Writable({
      write(_chunk, _enc, cb) {
        cb();
      },
    });

    const result = await taskifyStream(from, to)();
    expect(E.isRight(result)).toBe(true);
  });

  it("should handle multiple chunks from readable stream", async () => {
    const chunks = Array.from({ length: 10 }, (_, i) => `chunk${i}`);
    const from = Readable.from(chunks);
    const received: string[] = [];
    const to = new Writable({
      write(chunk, _enc, cb) {
        received.push(chunk.toString());
        cb();
      },
    });

    const result = await taskifyStream(from, to)();
    expect(E.isRight(result)).toBe(true);
    expect(received.length).toBe(10);
  });
});

import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RedisPubSub, type RedisPubSub as RedisPubSubType } from "./RedisPubSub.js";

const createMockContext = () => {
  const logger = {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  };

  const redis = {
    client: {
      publish: vi.fn().mockResolvedValue(1),
    },
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
  };

  return { redis, logger };
};

describe("RedisPubSub", () => {
  describe("creation", () => {
    it("should create a pubsub with correct channel name", () => {
      const TestPubSub = RedisPubSub(
        "test:channel",
        Schema.decodeUnknownEither(Schema.Struct({ id: Schema.String })),
      );

      expect(TestPubSub.channel).toBe("test:channel");
    });

    it("should have a decoder function", () => {
      const TestPubSub = RedisPubSub(
        "test:channel",
        Schema.decodeUnknownEither(Schema.Struct({ id: Schema.String })),
      );

      expect(typeof TestPubSub.decoder).toBe("function");
    });

    it("should decode valid input correctly", () => {
      const TestPubSub = RedisPubSub(
        "test:channel",
        Schema.decodeUnknownEither(Schema.Struct({ id: Schema.String })),
      );

      const result = TestPubSub.decoder({ id: "123" });
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toEqual({ id: "123" });
      }
    });

    it("should return Left for invalid input", () => {
      const TestPubSub = RedisPubSub(
        "test:channel",
        Schema.decodeUnknownEither(Schema.Struct({ id: Schema.String })),
      );

      const result = TestPubSub.decoder({ id: 123 });
      expect(result._tag).toBe("Left");
    });
  });

  describe("publish", () => {
    let TestPubSub: RedisPubSubType<{ id: string }, "test:channel">;

    beforeEach(() => {
      TestPubSub = RedisPubSub(
        "test:channel",
        Schema.decodeUnknownEither(Schema.Struct({ id: Schema.String })),
      );
    });

    it("should publish message to correct channel", async () => {
      const { redis, logger } = createMockContext();
      const ctx = { redis, logger } as any;
      const message = { id: "123" };

      await pipe(
        TestPubSub.publish(message)(ctx),
        throwTE,
      );

      expect(redis.client.publish).toHaveBeenCalledWith(
        "test:channel",
        JSON.stringify(message),
      );
    });

    it("should log debug message on publish", async () => {
      const { redis, logger } = createMockContext();
      const ctx = { redis, logger } as any;

      await pipe(
        TestPubSub.publish({ id: "456" })(ctx),
        throwTE,
      );

      expect(logger.debug.log).toHaveBeenCalledWith(
        "Published message to channel test:channel",
      );
    });

    it("should return number of subscribers", async () => {
      const { redis, logger } = createMockContext();
      const ctx = { redis, logger } as any;
      redis.client.publish.mockResolvedValueOnce(5);

      const result = await pipe(
        TestPubSub.publish({ id: "789" })(ctx),
        throwTE,
      );

      expect(result).toBe(5);
    });

    it("should return Left when publish fails", async () => {
      const { redis, logger } = createMockContext();
      const ctx = { redis, logger } as any;
      redis.client.publish.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await TestPubSub.publish({ id: "fail" })(ctx)();

      expect(result._tag).toBe("Left");
    });

    it("should return Left when no subscribers receive message", async () => {
      const { redis, logger } = createMockContext();
      const ctx = { redis, logger } as any;
      redis.client.publish.mockResolvedValueOnce(0);

      const result = await TestPubSub.publish({ id: "no-subs" })(ctx)();

      expect(result._tag).toBe("Left");
    });
  });
});

import { ctxHelper } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { describe, expect, it, vi } from "vitest";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type RedisContext } from "../../../context/redis.context.js";
import { RedisPubSub } from "../RedisPubSub.js";
import { Subscriber } from "../Subscriber.js";
import { toRedisError } from "../redis.error.js";

type TestCtx = LoggerContext & RedisContext;

const decodeFailure = (u: unknown): E.Either<ParseError, unknown> =>
  pipe(
    Schema.decodeUnknownEither(Schema.Struct({ _placeholder: Schema.Null }))(u),
  );

describe("Subscriber", () => {
  const mockLogger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  };

  const mockRedis = {
    client: {
      subscribe: vi.fn().mockResolvedValue(undefined),
    },
  };

  const mockCtx = ctxHelper.ctx<TestCtx>({
    logger: mockLogger,
    redis: mockRedis,
  });

  const mockPubSub = RedisPubSub("test-channel", (data: unknown) => {
    if (typeof data === "string") return E.right(data);
    if (typeof data === "object" && data !== null) return E.right(data);
    return decodeFailure(data);
  });

  const getHandler = (result: {
    _tag: "Right";
    right: (message: string) => Promise<void>;
  }): ((message: string) => Promise<void>) => result.right;

  it("returns a subscriber with subscribe method", () => {
    const sub = Subscriber(mockPubSub, vi.fn());
    expect(typeof sub.subscribe).toBe("function");
    expect(typeof sub.publish).toBe("function");
    expect(sub.channel).toBe("test-channel");
  });

  it("subscribe calls redis.client.subscribe", async () => {
    const handlerFn = vi.fn();
    const sub = Subscriber(mockPubSub, handlerFn);
    const result = await sub.subscribe(mockCtx)();
    const handler = result._tag === "Right" ? result.right : undefined;

    expect(mockRedis.client.subscribe).toHaveBeenCalledWith("test-channel");
    expect(mockLogger.debug.log).toHaveBeenCalledWith(
      "Subscribed to channel test-channel",
    );
    expect(typeof handler).toBe("function");
  });

  it("handler decodes and processes messages", async () => {
    const handlerFn = vi
      .fn()
      .mockImplementation(
        () => () => () => Promise.resolve({ _tag: "Right", right: undefined }),
      );

    const sub = Subscriber(mockPubSub, handlerFn);
    const result = await sub.subscribe(mockCtx)();

    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      await getHandler(result)(JSON.stringify({ test: "data" }));
    }

    expect(handlerFn).toHaveBeenCalledWith({ test: "data" });
  });

  it("handler logs errors when message handling fails", async () => {
    const handlerFn = vi.fn().mockImplementation(
      () => () => () =>
        Promise.resolve({
          _tag: "Left",
          left: toRedisError(new Error("handler error")),
        }),
    );

    const sub = Subscriber(mockPubSub, handlerFn);
    const result = await sub.subscribe(mockCtx)();

    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      await getHandler(result)(JSON.stringify({ test: "data" }));
    }

    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "Handling message for channel %s failed: %O",
      "test-channel",
      expect.anything(),
    );
  });

  it("handler logs success when message is processed", async () => {
    const handlerFn = vi
      .fn()
      .mockImplementation(
        () => () => () =>
          Promise.resolve({ _tag: "Right", right: { processed: true } }),
      );

    const sub = Subscriber(mockPubSub, handlerFn);
    const result = await sub.subscribe(mockCtx)();

    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      await getHandler(result)(JSON.stringify({ test: "data" }));
    }

    expect(mockLogger.debug.log).toHaveBeenCalledWith(
      "Message handled successfully for channel %s: %O",
      "test-channel",
      expect.anything(),
    );
  });

  it("handles decode errors", async () => {
    const handlerFn = vi.fn();

    const pubSub = RedisPubSub("bad-channel", (u: unknown) => decodeFailure(u));

    const sub = Subscriber(pubSub, handlerFn);
    const result = await sub.subscribe(mockCtx)();

    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      await getHandler(result)(JSON.stringify({ test: "data" }));
    }

    expect(handlerFn).not.toHaveBeenCalled();
    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "Handling message for channel %s failed: %O",
      "bad-channel",
      expect.anything(),
    );
  });
});

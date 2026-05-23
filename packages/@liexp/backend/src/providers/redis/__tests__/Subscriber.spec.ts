import { describe, expect, it, vi } from "vitest";
import { Subscriber } from "../Subscriber.js";
import { RedisPubSub } from "../RedisPubSub.js";
import { RedisError } from "../redis.error.js";

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

  const mockPubSub = RedisPubSub("test-channel", (data: unknown) => {
    if (typeof data === "string") return { _tag: "Right", right: data };
    return { _tag: "Left", left: new Error("parse error") };
  });

  const mockSubscribe = vi.fn().mockReturnValue({
    _tag: "Right",
    right: undefined,
  });

  const mockCtx = {
    logger: mockLogger as any,
    redis: mockRedis as any,
  };

  it("returns a subscriber with subscribe method", () => {
    const sub = Subscriber(mockPubSub as any, mockSubscribe);
    expect(typeof sub.subscribe).toBe("function");
    expect(typeof sub.publish).toBe("function");
    expect(sub.channel).toBe("test-channel");
  });

  it("subscribe calls redis.client.subscribe", async () => {
    const sub = Subscriber(mockPubSub as any, mockSubscribe);
    const handler = await sub.subscribe(mockCtx as any)();

    expect(mockRedis.client.subscribe).toHaveBeenCalledWith("test-channel");
    expect(mockLogger.debug.log).toHaveBeenCalledWith(
      "Subscribed to channel test-channel",
    );
    expect(typeof handler).toBe("function");
  });

  it("handler decodes and processes messages", async () => {
    const handlerFn = vi.fn().mockReturnValue({
      _tag: "Right",
      right: undefined,
    });

    const sub = Subscriber(mockPubSub as any, handlerFn);
    const handler = await sub.subscribe(mockCtx as any)();

    await handler!(JSON.stringify({ test: "data" }));

    expect(handlerFn).toHaveBeenCalledWith({ test: "data" });
  });

  it("handler logs errors when message handling fails", async () => {
    const handlerFn = vi.fn().mockReturnValue({
      _tag: "Left",
      left: new Error("handler error"),
    });

    const sub = Subscriber(mockPubSub as any, handlerFn);
    const handler = await sub.subscribe(mockCtx as any)();

    await handler!(JSON.stringify({ test: "data" }));

    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "Handling message for channel %s failed: %O",
      "test-channel",
      expect.anything(),
    );
  });

  it("handler logs success when message is processed", async () => {
    const handlerFn = vi.fn().mockReturnValue({
      _tag: "Right",
      right: { processed: true },
    });

    const sub = Subscriber(mockPubSub as any, handlerFn);
    const handler = await sub.subscribe(mockCtx as any)();

    await handler!(JSON.stringify({ test: "data" }));

    expect(mockLogger.debug.log).toHaveBeenCalledWith(
      "Message handled successfully for channel %s: %O",
      "test-channel",
      expect.anything(),
    );
  });

  it("handles decode errors", async () => {
    const handlerFn = vi.fn();

    const pubSub = RedisPubSub("bad-channel", () => ({
      _tag: "Left",
      left: new Error("decode failed"),
    }));

    const sub = Subscriber(pubSub as any, handlerFn);
    const handler = await sub.subscribe(mockCtx as any)();

    await handler!(JSON.stringify({ test: "data" }));

    expect(handlerFn).not.toHaveBeenCalled();
    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "Handling message for channel %s failed: %O",
      "bad-channel",
      expect.anything(),
    );
  });
});

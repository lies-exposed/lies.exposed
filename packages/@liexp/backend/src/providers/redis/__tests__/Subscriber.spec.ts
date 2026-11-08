import { describe, expect, it, vi } from "vitest";
import { RedisPubSub } from "../RedisPubSub.js";
import { Subscriber } from "../Subscriber.js";

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
    if (typeof data === "object" && data !== null)
      return { _tag: "Right", right: data };
    return { _tag: "Left", left: new Error("parse error") };
  });

  const mockCtx = {
    logger: mockLogger as any,
    redis: mockRedis as any,
  };

  it("returns a subscriber with subscribe method", () => {
    const sub = Subscriber(mockPubSub as any, vi.fn());
    expect(typeof sub.subscribe).toBe("function");
    expect(typeof sub.publish).toBe("function");
    expect(sub.channel).toBe("test-channel");
  });

  it("subscribe calls redis.client.subscribe", async () => {
    const handlerFn = vi.fn();
    const sub = Subscriber(mockPubSub as any, handlerFn);
    const result = await sub.subscribe(mockCtx)();
    const handler = result._tag === "Right" ? result.right : undefined;

    expect(mockRedis.client.subscribe).toHaveBeenCalledWith("test-channel");
    expect(mockLogger.debug.log).toHaveBeenCalledWith(
      "Subscribed to channel test-channel",
    );
    expect(typeof handler).toBe("function");
  });

  it("handler decodes and processes messages", async () => {
    const handlerFn = vi.fn().mockImplementation(() => {
      return (_ctx: any) => () =>
        Promise.resolve({
          _tag: "Right",
          right: undefined,
        } as any);
    });

    const sub = Subscriber(mockPubSub as any, handlerFn);
    const result = await sub.subscribe(mockCtx)();
    const handler = result._tag === "Right" ? result.right : undefined;

    await handler(JSON.stringify({ test: "data" }));

    expect(handlerFn).toHaveBeenCalledWith({ test: "data" });
  });

  it("handler logs errors when message handling fails", async () => {
    const handlerFn = vi.fn().mockImplementation(() => {
      return (_ctx: any) => () =>
        Promise.resolve({
          _tag: "Left",
          left: new Error("handler error"),
        } as any);
    });

    const sub = Subscriber(mockPubSub as any, handlerFn);
    const result = await sub.subscribe(mockCtx)();
    const handler = result._tag === "Right" ? result.right : undefined;

    await handler(JSON.stringify({ test: "data" }));

    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "Handling message for channel %s failed: %O",
      "test-channel",
      expect.anything(),
    );
  });

  it("handler logs success when message is processed", async () => {
    const handlerFn = vi.fn().mockImplementation(() => {
      return (_ctx: any) => () =>
        Promise.resolve({
          _tag: "Right",
          right: { processed: true },
        } as any);
    });

    const sub = Subscriber(mockPubSub as any, handlerFn);
    const result = await sub.subscribe(mockCtx)();
    const handler = result._tag === "Right" ? result.right : undefined;

    await handler(JSON.stringify({ test: "data" }));

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
    const result = await sub.subscribe(mockCtx)();
    const handler = result._tag === "Right" ? result.right : undefined;

    await handler(JSON.stringify({ test: "data" }));

    expect(handlerFn).not.toHaveBeenCalled();
    expect(mockLogger.error.log).toHaveBeenCalledWith(
      "Handling message for channel %s failed: %O",
      "bad-channel",
      expect.anything(),
    );
  });
});

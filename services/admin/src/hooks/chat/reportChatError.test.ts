import * as Sentry from "@sentry/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  reportChatClientError,
  reportChatStreamError,
} from "./reportChatError.js";

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));

describe("reportChatError", () => {
  beforeEach(() => vi.clearAllMocks());

  test("captures SSE error event with tags and fingerprint on error_code", () => {
    reportChatStreamError(
      {
        type: "error",
        timestamp: "t",
        error: "boom",
        error_code: "MESSAGE_COERCION_FAILURE",
        error_name: "Error",
      },
      {
        conversationId: "c1",
        provider: "localai",
        model: "m",
        messageCount: 3,
      },
    );
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const [err, opts] = vi.mocked(Sentry.captureException).mock.calls[0] as any;
    expect(err.message).toBe("boom");
    expect(opts.tags).toMatchObject({
      feature: "ai-chat",
      error_code: "MESSAGE_COERCION_FAILURE",
      provider: "localai",
      model: "m",
    });
    expect(opts.extra).toEqual({ conversation_id: "c1", message_count: 3 });
    expect(opts.fingerprint).toContain("MESSAGE_COERCION_FAILURE");
  });

  test("falls back to UNKNOWN code", () => {
    reportChatStreamError({ type: "error", timestamp: "t" }, {});
    const [, opts] = vi.mocked(Sentry.captureException).mock.calls[0] as any;
    expect(opts.tags.error_code).toBe("UNKNOWN");
  });

  test("captures client errors", () => {
    reportChatClientError(new TypeError("x"), {});
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});

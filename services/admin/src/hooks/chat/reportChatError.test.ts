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
    const mocked = vi.mocked(Sentry.captureException);
    expect(mocked).toHaveBeenCalledWith(expect.any(Error), {
      extra: { conversation_id: "c1", message_count: 3 },
      fingerprint: ["ai-chat", "stream", "MESSAGE_COERCION_FAILURE", "Error"],
      tags: {
        feature: "ai-chat",
        error_code: "MESSAGE_COERCION_FAILURE",
        provider: "localai",
        model: "m",
      },
    });
  });

  test("falls back to UNKNOWN code", () => {
    reportChatStreamError({ type: "error", timestamp: "t" }, {});
    const mock = vi.mocked(Sentry.captureException);
    expect(mock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { error_code: "UNKNOWN", feature: "ai-chat" },
      }),
    );
  });

  test("captures client errors", () => {
    reportChatClientError(new TypeError("x"), {});
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});

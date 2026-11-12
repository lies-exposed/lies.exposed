import { Sentry } from "@liexp/backend/lib/providers/sentry.provider.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { type AgentContext } from "../../../context/context.type.js";
import {
  captureChatError,
  getErrorCode,
  toChatErrorEvent,
} from "../chat.errors.js";

vi.mock("@liexp/backend/lib/providers/sentry.provider.js", () => ({
  Sentry: { isInitialized: vi.fn(), captureException: vi.fn() },
}));

describe("chat.errors", () => {
  beforeEach(() => vi.clearAllMocks());

  test("getErrorCode reads lc_error_code, defaults to UNKNOWN", () => {
    expect(
      getErrorCode(
        Object.assign(new Error("x"), {
          lc_error_code: "MESSAGE_COERCION_FAILURE",
        }),
      ),
    ).toBe("MESSAGE_COERCION_FAILURE");
    expect(getErrorCode(new Error("x"))).toBe("UNKNOWN");
    expect(getErrorCode(null)).toBe("UNKNOWN");
  });

  test("toChatErrorEvent keeps error string and adds structured fields", () => {
    const e = toChatErrorEvent(new TypeError("bad"), "fallback");
    expect(e).toMatchObject({
      type: "error",
      error: "bad",
      error_code: "UNKNOWN",
      error_name: "TypeError",
    });
    expect(toChatErrorEvent("str", "fallback").error).toBe("fallback");
  });

  test("captureChatError skips when Sentry not initialised", () => {
    vi.mocked(Sentry.isInitialized).mockReturnValue(false);
    captureChatError({} as Partial<AgentContext>, new Error("x"), {});
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  test("captureChatError sends tags/extras without message text", () => {
    vi.mocked(Sentry.isInitialized).mockReturnValue(true);
    captureChatError({} as Partial<AgentContext>, new Error("x"), {
      conversationId: "c1",
      agentType: "platform",
      provider: "localai",
      model: "m",
      messageLength: 12,
    });
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const opts = (
      vi.mocked(Sentry.captureException).mock.calls[0] as unknown[]
    )[1] as Record<string, unknown>;
    expect(opts.tags).toMatchObject({
      feature: "ai-chat",
      provider: "localai",
      model: "m",
      agent_type: "platform",
    });
    expect(opts.extra).toEqual({ conversation_id: "c1", message_length: 12 });
  });
});

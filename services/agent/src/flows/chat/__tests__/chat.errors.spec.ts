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

  test("getErrorCode prefers the typed error_code (MCP failures) over UNKNOWN", () => {
    // AgentMCPError.toTypedError() from @liexp/backend (HOM-1599): a distinct
    // code so Bugsink fingerprints MCP outages apart from generic agent errors.
    const mcpErr = Object.assign(
      new Error("Failed to load tools from server"),
      {
        name: "AgentMCPError",
        error_code: "MCP_TOOLS_UNAVAILABLE",
        mcp_failure: true,
      },
    );
    expect(getErrorCode(mcpErr)).toBe("MCP_TOOLS_UNAVAILABLE");
    expect(toChatErrorEvent(mcpErr, "fallback").error_code).toBe(
      "MCP_TOOLS_UNAVAILABLE",
    );
    expect(toChatErrorEvent(mcpErr, "fallback").error_name).toBe(
      "AgentMCPError",
    );
  });

  test("getErrorCode falls back to lc_error_code when no typed code", () => {
    const e = Object.assign(new Error("x"), {
      error_code: "",
      lc_error_code: "INVALID_PROMPT_INPUT",
    });
    expect(getErrorCode(e)).toBe("INVALID_PROMPT_INPUT");
  });

  test("captureChatError tags the typed MCP code for fingerprinting", () => {
    vi.mocked(Sentry.isInitialized).mockReturnValue(true);
    captureChatError(
      {} as Partial<AgentContext>,
      Object.assign(new Error("Server not initialized"), {
        name: "AgentMCPError",
        error_code: "MCP_TOOLS_UNAVAILABLE",
      }),
      { agentType: "platform" },
    );
    const opts = (
      vi.mocked(Sentry.captureException).mock.calls[0] as unknown[]
    )[1] as Record<string, unknown>;
    expect(opts.tags).toMatchObject({
      feature: "ai-chat",
      error_code: "MCP_TOOLS_UNAVAILABLE",
    });
    expect(opts.fingerprint).toEqual([
      "ai-chat",
      "MCP_TOOLS_UNAVAILABLE",
      "AgentMCPError",
    ]);
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

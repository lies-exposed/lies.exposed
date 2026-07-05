import { renderHook, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import {
  describe,
  expect,
  it,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import { useChatCompact, callCompactApi } from "./useChatCompact.js";

// Mock getAuthFromLocalStorage
vi.mock("@liexp/ui/lib/client/api.js", () => ({
  getAuthFromLocalStorage: vi.fn(() => "mock-token"),
}));

const BASE_URL = "http://localhost";
const COMPACT_URL = `${BASE_URL}/api/proxy/agent/chat/compact`;

describe("useChatCompact", () => {
  let mswServer: SetupServer;

  beforeAll(() => {
    mswServer = setupServer();
    mswServer.listen({ onUnhandledRequest: "error" });
  });

  afterEach(() => {
    vi.resetAllMocks();
    mswServer.resetHandlers();
  });

  afterAll(() => {
    mswServer.close();
  });

  describe("callCompactApi", () => {
    it("returns new_conversation_id and summary on success", async () => {
      mswServer.use(
        http.post(COMPACT_URL, () =>
          HttpResponse.json({
            data: {
              new_conversation_id: "new-conv",
              summary: "A concise summary.",
            },
          }),
        ),
      );

      const result = await callCompactApi("conv-123", BASE_URL);

      expect(result.new_conversation_id).toBe("new-conv");
      expect(result.summary).toBe("A concise summary.");
    });

    it("throws when endpoint returns non-ok status", async () => {
      mswServer.use(
        http.post(COMPACT_URL, () => HttpResponse.json({}, { status: 500 })),
      );

      await expect(callCompactApi("conv-123", BASE_URL)).rejects.toThrow(
        "Compact failed: 500",
      );
    });
  });

  describe("useChatCompact hook", () => {
    it("returns a compact function", () => {
      const setMessages = vi.fn();
      const { result } = renderHook(() =>
        useChatCompact({
          baseUrl: BASE_URL,
          messages: [{ id: "conv-1", role: "user" as any, parts: [] }],
          setMessages,
        }),
      );
      expect(typeof result.current.compact).toBe("function");
    });

    it("does nothing when messages array is empty", async () => {
      const setMessages = vi.fn();
      const { result } = renderHook(() =>
        useChatCompact({
          baseUrl: BASE_URL,
          messages: [],
          setMessages,
        }),
      );

      await act(async () => {
        await result.current.compact();
      });

      expect(setMessages).not.toHaveBeenCalled();
    });

    it("does nothing when last message has no id", async () => {
      const setMessages = vi.fn();
      const { result } = renderHook(() =>
        useChatCompact({
          baseUrl: BASE_URL,
          messages: [{ id: undefined, role: "user" as any, parts: [] }],
          setMessages,
        }),
      );

      await act(async () => {
        await result.current.compact();
      });

      expect(setMessages).not.toHaveBeenCalled();
    });

    it("replaces messages with compacted summary on success", async () => {
      mswServer.use(
        http.post(COMPACT_URL, () =>
          HttpResponse.json({
            data: {
              new_conversation_id: "new-conv-99",
              summary: "This is the summary.",
            },
          }),
        ),
      );

      const setMessages = vi.fn();
      const { result } = renderHook(() =>
        useChatCompact({
          baseUrl: BASE_URL,
          messages: [{ id: "conv-abc", role: "user" as any, parts: [] }],
          setMessages,
        }),
      );

      await act(async () => {
        await result.current.compact();
      });

      expect(setMessages).toHaveBeenCalledTimes(1);
      const calledMessages = setMessages.mock.calls[0][0];
      expect(calledMessages).toHaveLength(1);
      expect(calledMessages[0].id).toMatch(/^compact-/);
      expect(calledMessages[0].role).toBe("system");
      const textPart = calledMessages[0].parts[0] as { type: string; text: string };
      expect(textPart.type).toBe("text");
      expect(textPart.text).toContain("This is the summary.");
    });

    it("keeps existing messages when compact fails", async () => {
      mswServer.use(
        http.post(COMPACT_URL, () => HttpResponse.json({}, { status: 503 })),
      );

      const setMessages = vi.fn();
      const originalMessages = [{ id: "conv-fail", role: "user" as any, parts: [] }];
      const { result } = renderHook(() =>
        useChatCompact({
          baseUrl: BASE_URL,
          messages: originalMessages,
          setMessages,
        }),
      );

      await act(async () => {
        await result.current.compact();
      });

      expect(setMessages).not.toHaveBeenCalled();
    });
  });
});

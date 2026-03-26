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
import type { StreamingChatState } from "./types.js";
import { INITIAL_STATE } from "./types.js";
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
      const setState = vi.fn();
      const { result } = renderHook(() =>
        useChatCompact({
          conversationId: "conv-1",
          baseUrl: BASE_URL,
          setState,
        }),
      );
      expect(typeof result.current.compact).toBe("function");
    });

    it("does nothing when conversationId is null", async () => {
      const setState = vi.fn();
      const { result } = renderHook(() =>
        useChatCompact({ conversationId: null, baseUrl: BASE_URL, setState }),
      );

      await act(async () => {
        await result.current.compact();
      });

      expect(setState).not.toHaveBeenCalled();
    });

    it("sets loading, then resets state with summary message on success", async () => {
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

      const states: Parameters<typeof setState>[0][] = [];
      const setState = vi.fn(
        (updater: React.SetStateAction<StreamingChatState>) => {
          states.push(updater);
        },
      );

      const { result } = renderHook(() =>
        useChatCompact({
          conversationId: "conv-abc",
          baseUrl: BASE_URL,
          setState,
        }),
      );

      await act(async () => {
        await result.current.compact();
      });

      // First call: sets isLoading: true
      const firstUpdate = (
        states[0] as (prev: StreamingChatState) => StreamingChatState
      )(INITIAL_STATE);
      expect(firstUpdate.isLoading).toBe(true);
      expect(firstUpdate.error).toBeNull();

      // Second call: final compacted state
      const finalUpdate = (
        states[1] as (prev: StreamingChatState) => StreamingChatState
      )(INITIAL_STATE);
      expect(finalUpdate.conversationId).toBe("new-conv-99");
      expect(finalUpdate.messages).toHaveLength(1);
      expect(finalUpdate.messages[0].role).toBe("system");
      expect(finalUpdate.messages[0].content).toContain("This is the summary.");
      expect(finalUpdate.isLoading).toBe(false);
    });

    it("sets error state when compact fails", async () => {
      mswServer.use(
        http.post(COMPACT_URL, () => HttpResponse.json({}, { status: 503 })),
      );

      const states: Parameters<typeof setState>[0][] = [];
      const setState = vi.fn(
        (updater: React.SetStateAction<StreamingChatState>) => {
          states.push(updater);
        },
      );

      const { result } = renderHook(() =>
        useChatCompact({
          conversationId: "conv-fail",
          baseUrl: BASE_URL,
          setState,
        }),
      );

      await act(async () => {
        await result.current.compact();
      });

      const errorUpdate = (
        states[1] as (prev: StreamingChatState) => StreamingChatState
      )(INITIAL_STATE);
      expect(errorUpdate.error).toContain("Compact failed");
      expect(errorUpdate.isLoading).toBe(false);
    });
  });
});

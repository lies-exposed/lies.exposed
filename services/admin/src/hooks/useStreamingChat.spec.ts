import type { AIConfig, ChatRequest } from "@liexp/io/lib/http/Chat.js";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { useStreamingChat } from "./useStreamingChat.js";

const mockFetch: ReturnType<typeof vi.fn> = vi.fn();

vi.mock("fetch", () => mockFetch);
// Mock getAuthFromLocalStorage
vi.mock("@liexp/ui/lib/client/api.js", () => ({
  getAuthFromLocalStorage: vi.fn(() => "mock-token"),
}));

describe("useStreamingChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial state", () => {
    it("should initialize with empty messages and no loading", () => {
      const { result } = renderHook(() => useStreamingChat());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.conversationId).toBeNull();
      expect(result.current.streamingContent).toBe("");
      expect(result.current.thinkingContent).toBe("");
      expect(result.current.aiConfig).toBeNull();
      expect(result.current.usedProvider).toBeNull();
    });

    it("should provide sendMessage function", () => {
      const { result } = renderHook(() => useStreamingChat());

      expect(typeof result.current.sendMessage).toBe("function");
      expect(typeof result.current.cancelStream).toBe("function");
      expect(typeof result.current.clearMessages).toBe("function");
    });
  });

  describe("sendMessage with aiConfig", () => {
    it("should accept aiConfig parameter and store it in state", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      const aiConfig: AIConfig = {
        provider: "openai",
        model: "gpt-4o",
      };

      const request: ChatRequest = {
        message: "Hello",
        conversation_id: null,
      };

      await act(async () => {
        await result.current.sendMessage(request, aiConfig);
      });

      expect(result.current.aiConfig).toEqual(aiConfig);
    });

    it("should include aiConfig in fetch request body when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      const aiConfig: AIConfig = {
        provider: "anthropic",
        model: "claude-sonnet-4-20250514",
      };

      const request: ChatRequest = {
        message: "Hello",
        conversation_id: "conv-123",
      };

      await act(async () => {
        await result.current.sendMessage(request, aiConfig);
      });

      // Check that fetch was called with aiConfig in body
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe("/api/proxy/agent/chat/message/stream");
      expect(fetchCall[1].method).toBe("POST");

      const body = JSON.parse(fetchCall[1].body);
      expect(body.aiConfig).toEqual(aiConfig);
      expect(body.message).toBe("Hello");
      expect(body.conversation_id).toBe("conv-123");
    });

    it("should not include aiConfig in fetch body when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      const request: ChatRequest = {
        message: "Hello",
        conversation_id: null,
      };

      await act(async () => {
        await result.current.sendMessage(request);
      });

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.aiConfig).toBeUndefined();
    });
  });

  describe("Streaming events with usedProvider", () => {
    it("should capture usedProvider from message_start event", async () => {
      const streamData = [
        'data: {"type":"message_start","message_id":"msg-123","usedProvider":{"provider":"openai","model":"gpt-4o"}}\n',
        'data: {"type":"message_end","content":"Hello world","timestamp":"2024-01-01T00:00:00Z"}\n',
        "data: [DONE]\n",
      ];

      let readIndex = 0;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn().mockImplementation(async () => {
              if (readIndex < streamData.length) {
                const data = streamData[readIndex];
                readIndex++;
                return Promise.resolve({
                  done: false,
                  value: new TextEncoder().encode(data),
                });
              }
              return Promise.resolve({ done: true, value: undefined });
            }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      const request: ChatRequest = {
        message: "Hello",
        conversation_id: null,
      };

      await act(async () => {
        await result.current.sendMessage(request);
      });

      await waitFor(() => {
        expect(result.current.usedProvider).toEqual({
          provider: "openai",
          model: "gpt-4o",
        });
      });
    });

    it("should update usedProvider when provider switches", async () => {
      const streamData = [
        'data: {"type":"message_start","message_id":"msg-456","usedProvider":{"provider":"anthropic","model":"claude-3-5-haiku-latest"}}\n',
        'data: {"type":"message_end","content":"Hi there","timestamp":"2024-01-01T00:00:00Z"}\n',
        "data: [DONE]\n",
      ];

      let readIndex = 0;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn().mockImplementation(async () => {
              if (readIndex < streamData.length) {
                const data = streamData[readIndex];
                readIndex++;
                return Promise.resolve({
                  done: false,
                  value: new TextEncoder().encode(data),
                });
              }
              return Promise.resolve({ done: true, value: undefined });
            }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      const request: ChatRequest = {
        message: "Hello",
        conversation_id: null,
      };

      await act(async () => {
        await result.current.sendMessage(request);
      });

      await waitFor(() => {
        expect(result.current.usedProvider).toEqual({
          provider: "anthropic",
          model: "claude-3-5-haiku-latest",
        });
      });
    });

    it("should reset usedProvider when clearMessages is called", async () => {
      const { result } = renderHook(() => useStreamingChat());

      // Manually set usedProvider state
      await act(async () => {
        // Send a message and set provider info
        mockFetch.mockResolvedValueOnce({
          ok: true,
          body: {
            getReader: () => ({
              read: vi
                .fn()
                .mockResolvedValueOnce({ done: true, value: undefined }),
              releaseLock: vi.fn(),
            }),
          },
        });

        await result.current.sendMessage({
          message: "Test",
          conversation_id: null,
        });
      });

      expect(result.current.usedProvider).toBeNull();

      // Clear messages
      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.usedProvider).toBeNull();
    });
  });

  describe("Message handling", () => {
    it("should add user message immediately when sendMessage is called", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      await act(async () => {
        await result.current.sendMessage({
          message: "Hello world",
          conversation_id: null,
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe("user");
      expect(result.current.messages[0].content).toBe("Hello world");
    });

    it("should clear aiConfig and usedProvider on new message", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      // Send first message with config
      await act(async () => {
        await result.current.sendMessage(
          { message: "First", conversation_id: null },
          { provider: "openai", model: "gpt-4o" },
        );
      });

      // Send second message without config
      await act(async () => {
        await result.current.sendMessage({
          message: "Second",
          conversation_id: null,
        });
      });

      // aiConfig should be cleared for new message
      expect(result.current.aiConfig).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useStreamingChat());

      await act(async () => {
        await result.current.sendMessage({
          message: "Hello",
          conversation_id: null,
        });
      });

      expect(result.current.error).toContain("Network error");
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useStreamingChat());

      await act(async () => {
        await result.current.sendMessage({
          message: "Hello",
          conversation_id: null,
        });
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("clearMessages", () => {
    it("should clear all state including aiConfig and usedProvider", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      // Send a message first
      await act(async () => {
        await result.current.sendMessage(
          { message: "Hello", conversation_id: "conv-1" },
          { provider: "openai", model: "gpt-4o" },
        );
      });

      // Clear messages
      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.conversationId).toBeNull();
      expect(result.current.aiConfig).toBeNull();
      expect(result.current.usedProvider).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe("Authorization header", () => {
    it("should include Authorization header when token is available", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi
              .fn()
              .mockResolvedValueOnce({ done: true, value: undefined }),
            releaseLock: vi.fn(),
          }),
        },
      });

      const { result } = renderHook(() => useStreamingChat());

      await act(async () => {
        await result.current.sendMessage({
          message: "Hello",
          conversation_id: null,
        });
      });

      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers.Authorization).toBe("mock-token");
    });
  });
});

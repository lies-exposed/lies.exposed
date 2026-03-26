import type {
  ChatMessage,
  ChatRequest,
  ChatStreamEvent,
  AIConfig,
} from "@liexp/io/lib/http/Chat.js";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useCallback, useRef } from "react";
import { estimateTokens, type StreamingChatState } from "./types.js";
import { callCompactApi } from "./useChatCompact.js";

interface UseSendMessageOptions {
  proxyUrl: string;
  baseUrl: string;
  autoCompactRef: React.MutableRefObject<boolean>;
  setState: React.Dispatch<React.SetStateAction<StreamingChatState>>;
}

/** Apply a single SSE event to the current state, returning the next state. */
const applySseEvent = (
  prev: StreamingChatState,
  event: ChatStreamEvent,
  currentMessageIdRef: React.MutableRefObject<string | null>,
  request: ChatRequest,
  onStreamError: (err: string) => void,
): StreamingChatState => {
  const next = { ...prev };

  switch (event.type) {
    case "message_start":
      currentMessageIdRef.current = event.message_id ?? null;
      next.streamingContent = "";
      if (event.usedProvider) next.usedProvider = event.usedProvider;
      break;

    case "content_delta":
      if (event.content) {
        if (event.thinking) {
          next.thinkingContent += event.content;
        } else {
          next.streamingContent += event.content;
          const estimated = estimateTokens(next.streamingContent);
          if (!next.tokenUsage) {
            next.tokenUsage = {
              promptTokens: 0,
              completionTokens: estimated,
              totalTokens: estimated,
              isEstimated: true,
            };
          } else {
            next.tokenUsage = {
              ...next.tokenUsage,
              completionTokens: estimated,
              totalTokens: next.tokenUsage.promptTokens + estimated,
              isEstimated: true,
            };
          }
        }
      }
      break;

    case "tool_call_start":
      if (event.tool_call) {
        next.streamingContent = ""; // discard pre-tool preamble
        next.activeToolCalls = new Map(prev.activeToolCalls);
        next.activeToolCalls.set(event.tool_call.id, {
          name: event.tool_call.name,
          args: event.tool_call.arguments,
        });
        next.completedToolCalls = [...prev.completedToolCalls];
      }
      break;

    case "tool_call_end":
      if (event.tool_call) {
        const toolArgs = prev.activeToolCalls.get(event.tool_call.id)?.args;
        next.activeToolCalls = new Map(prev.activeToolCalls);
        next.activeToolCalls.delete(event.tool_call.id);
        next.completedToolCalls = [
          ...prev.completedToolCalls,
          {
            name: event.tool_call.name,
            result: event.tool_call.result ?? "No result",
          },
        ];
        const toolMessage: ChatMessage = {
          id: `tool-${event.tool_call.id}`,
          role: "tool",
          content: JSON.stringify(
            {
              tool: event.tool_call.name,
              arguments: toolArgs,
              result: event.tool_call.result,
            },
            null,
            2,
          ),
          timestamp: new Date().toISOString(),
          tool_call_id: event.tool_call.id,
        };
        next.messages = [...prev.messages, toolMessage];
      }
      break;

    case "message_end":
      next.streamingContent = "";
      next.thinkingContent = "";
      next.activeToolCalls = new Map();
      next.completedToolCalls = [];
      next.conversationId = request.conversation_id ?? prev.conversationId;
      if (currentMessageIdRef.current && event.content) {
        next.messages = [
          ...prev.messages,
          {
            id: currentMessageIdRef.current,
            role: "assistant",
            content: event.content,
            timestamp: event.timestamp,
          },
        ];
        if (event.usage) {
          next.tokenUsage = {
            promptTokens: event.usage.prompt_tokens ?? 0,
            completionTokens: event.usage.completion_tokens ?? 0,
            totalTokens: event.usage.total_tokens ?? 0,
            isEstimated: false,
          };
        }
      }
      break;

    case "error":
      next.error = event.error ?? "Unknown error";
      onStreamError(next.error);
      break;
  }

  return next;
};

/** Read the SSE response body and apply events to state. Returns any stream-level error message. */
const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  setState: React.Dispatch<React.SetStateAction<StreamingChatState>>,
  currentMessageIdRef: React.MutableRefObject<string | null>,
  request: ChatRequest,
  resetActivityTimeout: () => void,
): Promise<string | null> => {
  const decoder = new TextDecoder();
  let buffer = "";
  let streamComplete = false;
  let streamError: string | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        streamComplete = true;
        break;
      }

      resetActivityTimeout();
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        try {
          const event: ChatStreamEvent = JSON.parse(data);
          // eslint-disable-next-line no-console
          console.log("Received SSE event:", event.type, event);
          setState((prev) =>
            applySseEvent(prev, event, currentMessageIdRef, request, (err) => {
              streamError = err;
            }),
          );
        } catch (parseError) {
          // eslint-disable-next-line no-console
          console.error("Failed to parse SSE event:", parseError, data);
        }
      }
    }
  } catch (readError) {
    if (!streamComplete) {
      // eslint-disable-next-line no-console
      console.error("Stream reading error:", readError);
    }
  } finally {
    reader.releaseLock();
  }

  return streamError;
};

export const useSendMessage = ({
  proxyUrl,
  baseUrl,
  autoCompactRef,
  setState,
}: UseSendMessageOptions) => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeout_ = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    async (request: ChatRequest, aiConfig?: AIConfig): Promise<void> => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        streamingContent: "",
        thinkingContent: "",
        activeToolCalls: new Map(),
        completedToolCalls: [],
        tokenUsage: null,
        aiConfig: aiConfig ?? null,
        usedProvider: null,
      }));

      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: `user-${Date.now()}`,
            role: "user" as const,
            content: request.message,
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      try {
        const authToken = getAuthFromLocalStorage();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (authToken) headers.Authorization = authToken;

        const resetActivityTimeout = () => {
          clearTimeout_();
          timeoutIdRef.current = setTimeout(() => {
            abortController.abort();
          }, 60000);
        };
        resetActivityTimeout();

        const response = await fetch(`${baseUrl}${proxyUrl}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...request, ...(aiConfig && { aiConfig }) }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          clearTimeout_();
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        if (!response.body) {
          clearTimeout_();
          throw new Error("No response body");
        }

        const streamError = await processStream(
          response.body.getReader(),
          setState,
          currentMessageIdRef,
          request,
          resetActivityTimeout,
        );
        clearTimeout_();

        setState((prev) => ({ ...prev, isLoading: false }));

        // Auto-compact on context limit errors
        if (
          autoCompactRef.current &&
          streamError &&
          /token|context|limit|exceed/i.test(streamError)
        ) {
          const conversationId = request.conversation_id;
          if (conversationId) {
            try {
              const { new_conversation_id, summary } = await callCompactApi(
                conversationId,
                baseUrl,
              );
              setState((prev) => ({
                messages: [
                  {
                    id: `compact-${Date.now()}`,
                    role: "system" as const,
                    content: `Auto-compacted (context limit reached). Summary:\n\n${summary}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
                isLoading: false,
                error: null,
                conversationId: new_conversation_id,
                streamingContent: "",
                thinkingContent: "",
                activeToolCalls: new Map(),
                completedToolCalls: [],
                tokenUsage: null,
                aiConfig: prev.aiConfig,
                usedProvider: null,
              }));
            } catch {
              // compact failed silently — original stream error still shown
            }
          }
        }
      } catch (error) {
        clearTimeout_();

        if (error instanceof Error && error.name === "AbortError") {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              "Stream timeout (no data received for 60s) - the agent may be unresponsive",
          }));
          return;
        }

        const isBenign =
          error instanceof TypeError &&
          (error.message.includes("Error in input stream") ||
            error.message.includes("The stream has already been consumed") ||
            error.message.includes("network error"));

        if (!isBenign) {
          // eslint-disable-next-line no-console
          console.error("Streaming error:", error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to send message",
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    },
    [proxyUrl, baseUrl, autoCompactRef, setState],
  );

  return { sendMessage, cancelStream };
};

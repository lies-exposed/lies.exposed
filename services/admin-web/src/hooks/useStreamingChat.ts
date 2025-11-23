import type {
  ChatMessage,
  ChatRequest,
  ChatStreamEvent,
} from "@liexp/shared/lib/io/http/Chat.js";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useState, useCallback, useRef } from "react";
import { flushSync } from "react-dom";

interface StreamingChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  streamingContent: string; // Accumulated content from content_delta events
  activeToolCalls: Map<string, { name: string; args?: string }>;
  completedToolCalls: { name: string; result: string }[];
}

interface UseStreamingChatOptions {
  proxyUrl?: string;
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const { proxyUrl = "/api/proxy/agent/chat/message/stream" } = options;

  const [state, setState] = useState<StreamingChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
    streamingContent: "",
    activeToolCalls: new Map(),
    completedToolCalls: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (request: ChatRequest): Promise<void> => {
      // Cancel any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        streamingContent: "",
        activeToolCalls: new Map(),
        completedToolCalls: [],
      }));

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: request.message,
        timestamp: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      try {
        // Get auth token from localStorage
        const authToken = getAuthFromLocalStorage();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // Add Authorization header if token exists
        if (authToken) {
          headers.Authorization = authToken;
        }

        const response = await fetch(proxyUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(request),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let streamComplete = false;

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              streamComplete = true;
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6); // Remove "data: " prefix

                if (data === "[DONE]") {
                  // Stream completed
                  continue;
                }

                try {
                  const event: ChatStreamEvent = JSON.parse(data);

                  // Debug log for stream events
                  // eslint-disable-next-line no-console
                  console.log("Received SSE event:", event.type, event);

                  // Use flushSync to ensure each event causes an immediate render
                  flushSync(() => {
                    setState((prev) => {
                      const newState = { ...prev };

                      switch (event.type) {
                        case "message_start":
                          currentMessageIdRef.current =
                            event.message_id ?? null;
                          newState.streamingContent = "";
                          break;

                        case "content_delta":
                          if (event.content) {
                            newState.streamingContent += event.content;
                          }
                          break;

                        case "tool_call_start":
                          if (event.tool_call) {
                            newState.activeToolCalls = new Map(
                              prev.activeToolCalls,
                            );
                            newState.activeToolCalls.set(event.tool_call.id, {
                              name: event.tool_call.name,
                              args: event.tool_call.arguments,
                            });
                            newState.completedToolCalls = [
                              ...prev.completedToolCalls,
                            ];
                          }
                          break;

                        case "tool_call_end":
                          if (event.tool_call) {
                            // Get the arguments from the active tool call before deleting it
                            const toolArgs = prev.activeToolCalls.get(
                              event.tool_call.id,
                            )?.args;

                            newState.activeToolCalls = new Map(
                              prev.activeToolCalls,
                            );
                            newState.activeToolCalls.delete(event.tool_call.id);
                            newState.completedToolCalls = [
                              ...prev.completedToolCalls,
                              {
                                name: event.tool_call.name,
                                result: event.tool_call.result ?? "No result",
                              },
                            ];

                            // Add tool result as a message so users can see what happened
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

                            newState.messages = [...prev.messages, toolMessage];
                          }
                          break;

                        case "message_end":
                          // Finalize the assistant message
                          if (currentMessageIdRef.current && event.content) {
                            const assistantMessage: ChatMessage = {
                              id: currentMessageIdRef.current,
                              role: "assistant",
                              content: event.content,
                              timestamp: event.timestamp,
                            };

                            newState.messages = [
                              ...prev.messages,
                              assistantMessage,
                            ];
                            newState.streamingContent = "";
                            newState.activeToolCalls = new Map();
                            newState.completedToolCalls = [];
                            newState.conversationId =
                              request.conversation_id ?? prev.conversationId;
                          }
                          break;

                        case "error":
                          newState.error = event.error ?? "Unknown error";
                          break;
                      }

                      return newState;
                    });
                  });
                } catch (parseError) {
                  // eslint-disable-next-line no-console
                  console.error("Failed to parse SSE event:", parseError, data);
                }
              }
            }
          }
        } catch (streamError) {
          // Only log stream errors if the stream wasn't completed successfully
          if (!streamComplete) {
            // eslint-disable-next-line no-console
            console.error("Stream reading error:", streamError);
            // Don't throw here - the stream might have completed despite the error
          }
        } finally {
          reader.releaseLock();
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled
          return;
        }

        // Filter out benign stream completion errors
        const isBenignStreamError =
          error instanceof TypeError &&
          (error.message.includes("Error in input stream") ||
            error.message.includes("The stream has already been consumed") ||
            error.message.includes("network error"));

        if (!isBenignStreamError) {
          // eslint-disable-next-line no-console
          console.error("Streaming error:", error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to send message",
          }));
        } else {
          // For benign errors, just clear loading state
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      }
    },
    [proxyUrl],
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
      streamingContent: "",
      activeToolCalls: new Map(),
      completedToolCalls: [],
    });
  }, []);

  return {
    ...state,
    sendMessage,
    cancelStream,
    clearMessages,
  };
};

import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useCallback } from "react";
import type { StreamingChatState } from "./types.js";

interface UseChatCompactOptions {
  conversationId: string | null;
  baseUrl: string;
  setState: React.Dispatch<React.SetStateAction<StreamingChatState>>;
}

const makeCompactedState =
  (
    summary: string,
    newConversationId: string,
  ): ((prev: StreamingChatState) => StreamingChatState) =>
  (prev) => ({
    messages: [
      {
        id: `compact-${Date.now()}`,
        role: "system" as const,
        content: `Conversation compacted. Summary:\n\n${summary}`,
        timestamp: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: null,
    conversationId: newConversationId,
    streamingContent: "",
    thinkingContent: "",
    activeToolCalls: new Map(),
    completedToolCalls: [],
    tokenUsage: null,
    aiConfig: prev.aiConfig,
    usedProvider: null,
  });

export const callCompactApi = async (
  conversationId: string,
  baseUrl: string,
): Promise<{ new_conversation_id: string; summary: string }> => {
  const authToken = getAuthFromLocalStorage();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = authToken;

  const response = await fetch(`${baseUrl}/api/proxy/agent/chat/compact`, {
    method: "POST",
    headers,
    body: JSON.stringify({ conversation_id: conversationId }),
  });

  if (!response.ok) throw new Error(`Compact failed: ${response.status}`);

  const json = await response.json();
  return json.data as { new_conversation_id: string; summary: string };
};

export const useChatCompact = ({
  conversationId,
  baseUrl,
  setState,
}: UseChatCompactOptions) => {
  const compact = useCallback(async (): Promise<void> => {
    if (!conversationId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { new_conversation_id, summary } = await callCompactApi(
        conversationId,
        baseUrl,
      );
      setState(makeCompactedState(summary, new_conversation_id));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to compact conversation",
      }));
    }
  }, [conversationId, baseUrl, setState]);

  return { compact };
};

import type { UIMessage } from "@ai-sdk/react";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useCallback } from "react";

interface UseChatCompactOptions {
  baseUrl: string;
  conversationId: string | null;
  setMessages: (messages: UIMessage[]) => void;
  onConversationIdChange?: (conversationId: string | null) => void;
}

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
  baseUrl,
  conversationId,
  setMessages,
  onConversationIdChange,
}: UseChatCompactOptions) => {
  const compact = useCallback(async (): Promise<void> => {
    if (!conversationId) return;

    try {
      const { summary, new_conversation_id } = await callCompactApi(
        conversationId,
        baseUrl,
      );
      setMessages([
        {
          id: `compact-${Date.now()}`,
          role: "system",
          parts: [
            {
              type: "text",
              text: `Conversation compacted. Summary:\n\n${summary}`,
            },
          ],
        },
      ]);
      onConversationIdChange?.(new_conversation_id);
    } catch (error) {
      setMessages([
        {
          id: `compact-error-${Date.now()}`,
          role: "system",
          parts: [
            {
              type: "text",
              text: `Compact failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        },
      ]);
    }
  }, [baseUrl, conversationId, onConversationIdChange, setMessages]);

  return { compact };
};

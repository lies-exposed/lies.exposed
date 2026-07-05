import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useCallback } from "react";
import type { UIMessage } from "@ai-sdk/react";

interface UseChatCompactOptions {
  baseUrl: string;
  messages: UIMessage[];
  setMessages: (messages: UIMessage[]) => void;
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
  messages,
  setMessages,
}: UseChatCompactOptions) => {
  const compact = useCallback(async (): Promise<void> => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const conversationId = lastMessage?.id;
    if (!conversationId) return;

    try {
      const { summary } = await callCompactApi(conversationId, baseUrl);
      setMessages([
        {
          id: `compact-${Date.now()}`,
          role: "system",
          parts: [{ type: "text", text: `Conversation compacted. Summary:\n\n${summary}` }],
        } as unknown as UIMessage,
      ]);
    } catch {
      // compact failed — keep existing messages
    }
  }, [baseUrl, messages, setMessages]);

  return { compact };
};

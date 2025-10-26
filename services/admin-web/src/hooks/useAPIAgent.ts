import { useCallback, useMemo } from "react";

interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  model?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
}

interface APIResponse {
  data: ChatResponse;
}

interface AgentClient {
  sendMessage: (
    data: ChatRequest,
  ) => Promise<{ message: ChatMessage; conversationId: string }>;
  baseUrl: string;
}

export const useAPIAgent = (): AgentClient => {
  const baseUrl = useMemo(() => {
    // Use environment variable or fallback based on current location
    if (import.meta.env.VITE_AGENT_URL) {
      return import.meta.env.VITE_AGENT_URL;
    }

    // Fallback for development
    return window.location.hostname.includes("localhost")
      ? "http://localhost:3003/v1"
      : "https://agent.liexp.dev/v1";
  }, []);

  const sendMessage = useCallback(
    async (
      data: ChatRequest,
    ): Promise<{ message: ChatMessage; conversationId: string }> => {
      const response = await fetch(`${baseUrl}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse = await response.json();
      return {
        message: result.data.message,
        conversationId: result.data.conversationId,
      };
    },
    [baseUrl],
  );

  return {
    sendMessage,
    baseUrl,
  };
};

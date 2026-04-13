import type { ChatConversation, ChatMessage } from "@liexp/io/lib/http/Chat.js";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useState, useEffect, useCallback } from "react";

interface ListConversationsResponse {
  total: number;
  data: ChatConversation[];
}

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return (
      (window as unknown as { ENV?: { AGENT_API_URL?: string } }).ENV
        ?.AGENT_API_URL ?? "/api/proxy/agent"
    );
  }
  return "/api/proxy/agent";
};

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = getAuthFromLocalStorage();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers.Authorization = authToken;
      }

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/chat/conversations`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversations: ${response.statusText}`,
        );
      }

      const data: ListConversationsResponse = await response.json();
      setConversations(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const authToken = getAuthFromLocalStorage();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers.Authorization = authToken;
      }

      const baseUrl = getBaseUrl();
      const response = await fetch(
        `${baseUrl}/chat/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete conversation: ${response.statusText}`,
        );
      }

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    deleteConversation,
  };
};

export const useChatConversation = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchConversation = async () => {
      setLoading(true);
      setError(null);

      try {
        const authToken = getAuthFromLocalStorage();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (authToken) {
          headers.Authorization = authToken;
        }

        const baseUrl = getBaseUrl();
        const response = await fetch(
          `${baseUrl}/chat/conversations/${conversationId}`,
          {
            method: "GET",
            headers,
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch conversation: ${response.statusText}`,
          );
        }

        const data: { data: ChatConversation } = await response.json();
        setMessages(data.data.messages as ChatMessage[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void fetchConversation();
  }, [conversationId]);

  return { messages, loading, error };
};

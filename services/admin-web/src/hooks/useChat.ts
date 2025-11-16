import type {
  ChatMessage,
  ChatRequest,
} from "@liexp/shared/lib/io/http/Chat.js";
import { useCallback, useState } from "react";
import { type AgentAPIError, useAPIAgent } from "./useAPIAgent.js";

export interface UseChatOptions {
  /**
   * Callback invoked when a message is successfully sent
   */
  onSuccess?: (message: ChatMessage, conversationId: string) => void;

  /**
   * Callback invoked when an error occurs
   */
  onError?: (error: AgentAPIError) => void;
}

export interface UseChatResult {
  /**
   * Send a chat message via the proxy
   */
  sendMessage: (
    message: string,
    conversationId?: string | null,
    model?: string,
  ) => Promise<void>;

  /**
   * Loading state - true while a message is being sent
   */
  loading: boolean;

  /**
   * Error state - contains error if the last request failed
   */
  error: AgentAPIError | null;

  /**
   * Clear the error state
   */
  clearError: () => void;

  /**
   * The last response received
   */
  lastResponse: { message: ChatMessage; conversationId: string } | null;
}

/**
 * React hook for sending chat messages via the admin-web proxy
 *
 * @example
 * ```tsx
 * const { sendMessage, loading, error } = useChat({
 *   onSuccess: (message, conversationId) => {
 *     console.log('Message sent:', message);
 *   },
 * });
 *
 * const handleSend = async () => {
 *   await sendMessage('Hello, agent!');
 * };
 * ```
 */
export const useChat = (options?: UseChatOptions): UseChatResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AgentAPIError | null>(null);
  const [lastResponse, setLastResponse] = useState<{
    message: ChatMessage;
    conversationId: string;
  } | null>(null);

  const client = useAPIAgent();

  const sendMessage = useCallback(
    async (message: string, conversationId?: string | null, model?: string) => {
      setLoading(true);
      setError(null);

      const request: ChatRequest = {
        message,
        conversation_id: conversationId ?? null,
        model,
      };

      try {
        const response = await client.sendMessage(request);
        setLastResponse(response);
        options?.onSuccess?.(response.message, response.conversationId);
      } catch (err) {
        const apiError = err as AgentAPIError;
        setError(apiError);
        options?.onError?.(apiError);
      } finally {
        setLoading(false);
      }
    },
    [client, options],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    loading,
    error,
    clearError,
    lastResponse,
  };
};

/**
 * Hook for managing conversation history
 * Stores messages in component state
 */
export interface UseConversationHistoryResult {
  /**
   * All messages in the current conversation
   */
  messages: ChatMessage[];

  /**
   * Current conversation ID
   */
  conversationId: string | null;

  /**
   * Add a message to the conversation
   */
  addMessage: (message: ChatMessage, conversationId: string) => void;

  /**
   * Clear all messages and reset conversation
   */
  clearConversation: () => void;
}

export const useConversationHistory = (): UseConversationHistoryResult => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const addMessage = useCallback(
    (message: ChatMessage, newConversationId: string) => {
      setMessages((prev) => [...prev, message]);
      setConversationId(newConversationId);
    },
    [],
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    conversationId,
    addMessage,
    clearConversation,
  };
};

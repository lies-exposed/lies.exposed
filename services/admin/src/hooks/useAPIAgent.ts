import type {
  ChatMessage,
  ChatRequest,
} from "@liexp/shared/lib/io/http/Chat.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { useCallback } from "react";
import { useAgentAPI } from "./useAgentAPI.js";

interface AgentClient {
  sendMessage: (
    data: ChatRequest,
  ) => Promise<{ message: ChatMessage; conversationId: string }>;
}

/**
 * Hook for interacting with the Agent API
 * Uses the typed endpoint client via useAgentAPI
 * Communicates through the admin-web proxy which handles M2M authentication
 */
export const useAPIAgent = (): AgentClient => {
  const agentAPI = useAgentAPI();

  const sendMessage = useCallback(
    async (
      data: ChatRequest,
    ): Promise<{ message: ChatMessage; conversationId: string }> => {
      // Use typed endpoint client - wrap data in Body property
      const response = await pipe(
        agentAPI.Chat.Create({
          Body: data,
        }),
        throwTE,
      );

      return response.data;
    },
    [agentAPI],
  );

  return {
    sendMessage,
  };
};

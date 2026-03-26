import { useConfiguration } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { useState, useCallback } from "react";
import { INITIAL_STATE, type StreamingChatState } from "./chat/types.js";
import { useChatAutoCompact } from "./chat/useChatAutoCompact.js";
import { useChatCompact } from "./chat/useChatCompact.js";
import { useSendMessage } from "./chat/useSendMessage.js";

interface UseStreamingChatOptions {
  proxyUrl?: string;
  initialAutoCompact?: boolean;
  onAutoCompactChange?: (value: boolean) => void;
}

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const {
    proxyUrl = "/api/proxy/agent/chat/message/stream",
    initialAutoCompact = false,
    onAutoCompactChange,
  } = options;

  const config = useConfiguration();
  const baseUrl = config.platforms.admin.url;

  const [state, setState] = useState<StreamingChatState>(INITIAL_STATE);

  const { autoCompact, autoCompactRef, toggleAutoCompact } = useChatAutoCompact(
    {
      initialValue: initialAutoCompact,
      onChange: onAutoCompactChange,
    },
  );

  const { sendMessage, cancelStream } = useSendMessage({
    proxyUrl,
    baseUrl,
    autoCompactRef,
    setState,
  });

  const { compact } = useChatCompact({
    conversationId: state.conversationId,
    baseUrl,
    setState,
  });

  const clearMessages = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    sendMessage,
    cancelStream,
    clearMessages,
    compact,
    autoCompact,
    toggleAutoCompact,
  };
};

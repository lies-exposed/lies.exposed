import type { ChatMessage } from "@liexp/io/lib/http/Chat.js";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useConfiguration } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chat, useChat } from "@ai-sdk/react";
import { useChatAutoCompact } from "./chat/useChatAutoCompact.js";
import { useChatCompact } from "./chat/useChatCompact.js";

interface UseStreamingChatOptions {
  proxyUrl?: string;
  initialAutoCompact?: boolean;
  onAutoCompactChange?: (value: boolean) => void;
}

const buildConversationId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `conv-${Date.now()}`;
};

const parseToolPayload = (
  content: string | undefined,
): { toolName: string; input: unknown; output: unknown } => {
  if (!content) {
    return { toolName: "tool", input: {}, output: {} };
  }

  try {
    const parsed = JSON.parse(content) as {
      tool?: string;
      arguments?: string;
      result?: string;
    };
    const input = parsed.arguments ? JSON.parse(parsed.arguments) : {};
    const output = parsed.result ? JSON.parse(parsed.result) : {};
    return {
      toolName: parsed.tool ?? "tool",
      input,
      output,
    };
  } catch {
    return {
      toolName: "tool",
      input: {},
      output: content,
    };
  }
};

const transformChatMessageToUIMessage = (msg: ChatMessage): UIMessage => {
  const timestamp =
    typeof msg.timestamp === "string"
      ? msg.timestamp
      : new Date().toISOString();

  if (msg.role === "tool") {
    const payload = parseToolPayload(msg.content);
    return {
      id: msg.id,
      role: "assistant",
      metadata: { timestamp },
      parts: [
        {
          type: "dynamic-tool",
          toolName: payload.toolName,
          toolCallId: msg.tool_call_id ?? `tool-${msg.id}`,
          state: "output-available",
          input: payload.input,
          output: payload.output,
        },
      ],
    };
  }

  return {
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    metadata: { timestamp },
    parts: [{ type: "text", text: msg.content || "" }],
  };
};

const createChatInstance = (proxyUrl: string) => {
  return new Chat({
    transport: new DefaultChatTransport({
      api: proxyUrl,
      headers: () => {
        const token = getAuthFromLocalStorage();
        return token ? { Authorization: token } : Object.create({});
      },
    }),
  });
};

export const useStreamingChat = (options: UseStreamingChatOptions = {}) => {
  const {
    proxyUrl = "/api/proxy/agent/chat/message/ai-stream",
    initialAutoCompact = false,
    onAutoCompactChange,
  } = options;

  const config = useConfiguration();
  const baseUrl = config.platforms.admin.url;

  const { autoCompact, autoCompactRef, toggleAutoCompact } = useChatAutoCompact({
    initialValue: initialAutoCompact,
    onChange: onAutoCompactChange,
  });

  const chatRef = useRef(createChatInstance(proxyUrl));
  const conversationIdRef = useRef<string | null>(null);
  const compactingRef = useRef(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const {
    messages: uiMessages,
    status,
    error: rawError,
    sendMessage,
    setMessages,
  } = useChat({
    chat: chatRef.current,
  });

  const { compact } = useChatCompact({
    baseUrl,
    conversationId,
    setMessages,
    onConversationIdChange: (nextConversationId) => {
      conversationIdRef.current = nextConversationId;
      setConversationId(nextConversationId);
    },
  });

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = null;
    setConversationId(null);
  }, [setMessages]);

  const loadConversation = useCallback(
    (nextConversationId: string, chatMessages: ChatMessage[]) => {
      const transformed = chatMessages.map(transformChatMessageToUIMessage);
      setMessages(transformed);
      conversationIdRef.current = nextConversationId;
      setConversationId(nextConversationId);
    },
    [setMessages],
  );

  const sendMessageWrapped = useCallback(
    async (
      request: { message: string; conversation_id?: string | null },
      aiConfig?: { provider: string; model?: string },
    ) => {
      const activeConversationId =
        request.conversation_id ?? conversationIdRef.current ?? buildConversationId();

      conversationIdRef.current = activeConversationId;
      setConversationId(activeConversationId);

      try {
        await sendMessage(
          {
            text: request.message,
          },
          {
            body: {
              ...request,
              conversation_id: activeConversationId,
              aiConfig,
            },
          },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (
          autoCompactRef.current &&
          /token|context|limit|exceed/i.test(message)
        ) {
          compactingRef.current = true;
          await compact();
          compactingRef.current = false;
        }
      }
    },
    [autoCompactRef, compact, sendMessage],
  );

  useEffect(() => {
    if (!rawError || !autoCompactRef.current || !conversationId) return;
    if (!/token|context|limit|exceed/i.test(rawError.message)) return;
    if (compactingRef.current) return;

    compactingRef.current = true;
    void compact().finally(() => {
      compactingRef.current = false;
    });
  }, [autoCompactRef, compact, conversationId, rawError]);

  return {
    messages: uiMessages,
    isLoading: status === "streaming" || status === "submitted",
    error: rawError?.message ?? null,
    conversationId,
    sendMessage: sendMessageWrapped,
    clearMessages,
    loadConversation,
    compact,
    autoCompact,
    toggleAutoCompact,
  };
};

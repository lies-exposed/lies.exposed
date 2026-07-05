import type { ChatMessage } from "@liexp/io/lib/http/Chat.js";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { useConfiguration } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { useCallback, useMemo, useRef } from "react";
import { DefaultChatTransport } from "ai";
import { Chat, useChat } from "@ai-sdk/react";
import { useChatAutoCompact } from "./chat/useChatAutoCompact.js";
import { useChatCompact } from "./chat/useChatCompact.js";

interface UseStreamingChatOptions {
  proxyUrl?: string;
  initialAutoCompact?: boolean;
  onAutoCompactChange?: (value: boolean) => void;
}

const transformPartToToolCall = (
  part: any,
): { id: string; type: "function"; function: { name: string; arguments: string } } | undefined => {
  if (part.type !== "tool-call") return undefined;
  const argsStr = typeof part.args === "string" ? part.args : JSON.stringify(part.args ?? {});
  return {
    id: part.toolCallId,
    type: "function" as const,
    function: {
      name: part.toolName,
      arguments: argsStr,
    },
  };
};

const transformUIMessageToChatMessage = (
  uiMsg: any,
  index: number,
): ChatMessage[] => {
  const result: ChatMessage[] = [];
  const timestamp = new Date().toISOString();

  if (uiMsg.role === "user") {
    const content = uiMsg.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("")
      .trim();
    if (content) {
      result.push({
        id: uiMsg.id || `msg-${index}`,
        role: "user",
        content,
        timestamp,
      });
    }
  } else if (uiMsg.role === "assistant") {
    const textParts = uiMsg.parts?.filter((p: any) => p.type === "text") ?? [];
    const toolCallParts = uiMsg.parts?.filter((p: any) => p.type === "tool-call") ?? [];
    const toolResultParts = uiMsg.parts?.filter((p: any) => p.type === "tool-result") ?? [];
    const reasoningParts = uiMsg.parts?.filter((p: any) => p.type === "reasoning") ?? [];

    const content = textParts.map((p: any) => p.text).join("").trim();
    const toolCalls = toolCallParts.map(transformPartToToolCall).filter(Boolean) as any[];
    const reasoningContent = reasoningParts.map((p: any) => p.text || p.recommendation || "").join("\n");

    if (content || toolCalls.length > 0) {
      result.push({
        id: uiMsg.id || `msg-${index}`,
        role: "assistant",
        content: content || undefined,
        timestamp,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        ...(reasoningContent ? { structured_output: { thinking: reasoningContent } } : {}),
      });
    }

    for (const part of toolResultParts) {
      if (part.type === "tool-result" && part.result) {
        const toolResponseContent = typeof part.result === "string" ? part.result : JSON.stringify(part.result);
        result.push({
          id: `msg-${index}-tool-${part.toolCallId}`,
          role: "tool",
          content: toolResponseContent,
          timestamp,
          tool_call_id: part.toolCallId,
        });
      }
    }
  } else if (uiMsg.role === "system") {
    const content = uiMsg.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("").trim();
    if (content) {
      result.push({
        id: uiMsg.id || `msg-${index}`,
        role: "system",
        content,
        timestamp,
      });
    }
  }

  return result;
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

  const { autoCompact, toggleAutoCompact } = useChatAutoCompact({
    initialValue: initialAutoCompact,
    onChange: onAutoCompactChange,
  });

  const chatRef = useRef(createChatInstance(proxyUrl));

  const {
    messages: uiMessages,
    status,
    error: rawError,
    sendMessage,
    setMessages,
  } = useChat({
    chat: chatRef.current,
  });

  const messages = useMemo(
    () =>
      uiMessages.flatMap((msg, idx) => transformUIMessageToChatMessage(msg, idx)),
    [uiMessages],
  );

  const { compact } = useChatCompact({
    baseUrl,
    messages: uiMessages,
    setMessages,
  });

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const loadConversation = useCallback(
    (_conversationId: string, chatMessages: ChatMessage[]) => {
      const uiMessages = chatMessages.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        parts: [{ type: "text" as const, text: msg.content || "" }],
      }));
      (setMessages as (msgs: any) => void)(uiMessages);
    },
    [setMessages],
  );

const sendMessageWrapped = useCallback(
  async (
    request: { message: string; conversation_id?: string | null },
    aiConfig?: { provider: string; model?: string },
  ) => {
    await sendMessage(
      {
        text: request.message,
      },
      {
        body: {
          ...request,
          aiConfig,
        },
      },
    );
  },
  [sendMessage],
);

  const streamingMessage = useMemo(() => {
    if (status !== "streaming" || uiMessages.length === 0) return null;
    const lastMsg = uiMessages[uiMessages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return null;

    const textContent = lastMsg.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("")
      .trim();

    const toolCalls = lastMsg.parts
      ?.filter((p: any) => p.type === "tool-call")
      .map((p: any) => ({
        id: p.toolCallId,
        type: "function" as const,
        function: {
          name: p.toolName,
          arguments: typeof p.args === "string" ? p.args : JSON.stringify(p.args ?? {}),
        },
      }));

    const thinkingContent = lastMsg.parts
      ?.filter((p: any) => p.type === "reasoning")
      .map((p: any) => p.text || p.recommendation || "")
      .join("\n");

    return {
      content: textContent || "",
      tool_calls: toolCalls?.length ? toolCalls : undefined,
      timestamp: new Date().toISOString(),
      thinkingContent: thinkingContent || undefined,
    };
  }, [uiMessages, status]);

  return {
    messages,
    isLoading: status === "streaming" || status === "submitted",
    error: rawError?.message ?? null,
    conversationId: uiMessages.length > 0 ? uiMessages[uiMessages.length - 1]?.id ?? null : null,
    sendMessage: sendMessageWrapped,
    clearMessages,
    loadConversation,
    compact,
    autoCompact,
    toggleAutoCompact,
    streamingMessage,
  };
};

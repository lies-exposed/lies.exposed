import { ChatUI } from "@liexp/ui/lib/components/Chat/ChatUI.js";
import {
  useRecordContext,
  useResourceContext,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import React, { useState, useMemo } from "react";
import { useLocation } from "react-router";
import { useStreamingChat } from "../../hooks/useStreamingChat.js";

interface ChatProps {
  className?: string;
}

export const AdminChat: React.FC<ChatProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isFullSize, setIsFullSize] = useState(false);
  const [isContextEnabled, setIsContextEnabled] = useState(false);

  const location = useLocation();

  // Use streaming chat hook
  const {
    messages,
    isLoading,
    error,
    conversationId,
    streamingContent,
    activeToolCalls,
    sendMessage,
  } = useStreamingChat();

  // Use react-admin hooks to get resource context
  const hookResource = useResourceContext();
  const hookRecord = useRecordContext();

  // Extract resource context from hooks or fallback to URL parsing
  const context = useMemo(():
    | {
        resource: string;
        recordId: string | null;
        action?: string;
      }
    | undefined => {
    if (!isContextEnabled) return undefined;

    if (hookResource) {
      const pathParts = location.pathname.split("/").filter(Boolean);
      const recordId = hookRecord?.id ? String(hookRecord.id) : null;

      const action = pathParts.includes("create")
        ? "create"
        : pathParts.includes("show")
          ? "show"
          : recordId
            ? "edit"
            : "list";

      return {
        resource: hookResource,
        recordId,
        action,
      };
    }

    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) return undefined;

    const resource = pathParts[0];
    const recordId =
      pathParts.length > 1 && !["create", "show"].includes(pathParts[1])
        ? pathParts[1]
        : null;

    const action = pathParts.includes("create")
      ? "create"
      : pathParts.includes("show")
        ? "show"
        : recordId
          ? "edit"
          : "list";

    return {
      resource,
      recordId,
      action,
    };
  }, [isContextEnabled, hookResource, hookRecord, location.pathname]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsFullSize(false);
    }
  };

  const handleToggleFullSize = () => {
    setIsFullSize(!isFullSize);
  };

  const handleToggleContext = () => {
    setIsContextEnabled(!isContextEnabled);
  };

  // Generate context label for display
  const contextLabel = useMemo(() => {
    if (!context) return undefined;

    const idDisplay = context.recordId
      ? `#${context.recordId.substring(0, 8)}${context.recordId.length > 8 ? "..." : ""}`
      : "";
    return `${context.resource}${idDisplay}`;
  }, [context]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const request = {
      message: inputValue.trim(),
      conversation_id: conversationId,
      resource_context: isContextEnabled ? context : undefined,
    };

    setInputValue("");
    await sendMessage(request);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  // Create streaming message object if there's content
  const streamingMessage = useMemo(() => {
    if (!streamingContent) return null;

    // Convert activeToolCalls Map to array of ToolCall objects
    const toolCalls = Array.from(activeToolCalls.entries()).map(
      ([id, { name, args }]) => ({
        id,
        type: "function" as const,
        function: {
          name,
          arguments: args ?? "",
        },
      }),
    );

    // Use current timestamp for streaming messages
    return {
     content: streamingContent,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      timestamp: new Date().toISOString(),
    };
  }, [streamingContent, activeToolCalls]);

  return (
    <ChatUI
      className={className}
      isOpen={isOpen}
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      error={error ?? undefined}
      welcomeMessage="Welcome! I'm your AI assistant for the lies.exposed platform. Ask me about actors, events, fact-checking, or anything else you need help with."
      inputPlaceholder="Type your message..."
      title="AI Assistant"
      onToggle={handleToggleChat}
      onInputChange={setInputValue}
      onSendMessage={() => void handleSendMessage()}
      onKeyPress={handleKeyPress}
      isFullSize={isFullSize}
      onToggleFullSize={handleToggleFullSize}
      isContextEnabled={isContextEnabled}
      onToggleContext={handleToggleContext}
      contextLabel={contextLabel}
      streamingMessage={streamingMessage}
    />
  );
};

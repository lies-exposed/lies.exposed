import { type ChatMessage } from "@liexp/shared/lib/io/http/Chat.js";
import { ChatUI } from "@liexp/ui/lib/components/Chat/ChatUI.js";
import React, { useState } from "react";
import { useAPIAgent } from "../../hooks/useAPIAgent.js";

interface ChatProps {
  className?: string;
}

export const AdminChat: React.FC<ChatProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [isFullSize, setIsFullSize] = useState(false);

  const agentClient = useAPIAgent();

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
    if (!isOpen) {
      setIsFullSize(false); // Reset to normal size when closing
    }
  };

  const handleToggleFullSize = () => {
    setIsFullSize(!isFullSize);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLastUserMessage(userMessage.content);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const request = {
        message: userMessage.content,
        conversation_id: conversationId,
      };

      const result = await agentClient.sendMessage(request);

      if (result) {
        const assistantMessage: ChatMessage = {
          id: result.message.id,
          role: result.message.role,
          content: result.message.content,
          timestamp: result.message.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(result.conversationId);
      }
    } catch (err) {
      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error("Chat error:", err);
      setError("Failed to send message. Please try again.");

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (): Promise<void> => {
    if (!lastUserMessage || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const request = {
        message: lastUserMessage,
        conversation_id: conversationId,
      };

      const result = await agentClient.sendMessage(request);

      if (result) {
        const assistantMessage: ChatMessage = {
          id: result.message.id,
          role: result.message.role,
          content: result.message.content,
          timestamp: result.message.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(result.conversationId);
        setLastUserMessage(null);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Chat retry error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <ChatUI
      className={className}
      isOpen={isOpen}
      messages={messages}
      inputValue={inputValue}
      isLoading={isLoading}
      error={error}
      welcomeMessage="Welcome! I'm your AI assistant for the lies.exposed platform. Ask me about actors, events, fact-checking, or anything else you need help with."
      inputPlaceholder="Type your message..."
      title="AI Assistant"
      onToggle={handleToggleChat}
      onInputChange={setInputValue}
      onSendMessage={() => void handleSendMessage()}
      onKeyPress={handleKeyPress}
      onRetry={error ? () => void handleRetry() : undefined}
      isFullSize={isFullSize}
      onToggleFullSize={handleToggleFullSize}
    />
  );
};

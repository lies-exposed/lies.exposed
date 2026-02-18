import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { styled } from "../../theme/index.js";
import { Box, Paper, Icons } from "../mui/index.js";
import { ChatHeader } from "./ChatHeader.js";
import { ChatInput } from "./ChatInput.js";
import { ContentMessage } from "./ContentMessage.js";
import { ErrorDisplay } from "./ErrorDisplay.js";
import { LoadingMessage } from "./LoadingMessage.js";
import { ProviderSelector } from "./ProviderSelector.js";
import { StreamingMessage } from "./StreamingMessage.js";
import { ToolMessage } from "./ToolMessage.js";
import { WelcomeMessage } from "./WelcomeMessage.js";

// Styled components
const FloatingButton = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  width: 60,
  height: 60,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  zIndex: 1300,
  boxShadow: theme.shadows[6],
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.05)",
  },
  transition: "all 0.2s ease-in-out",
}));

const ChatModal = styled(Paper)<{ isFullSize: boolean }>(
  ({ theme, isFullSize }) => ({
    position: "fixed",
    bottom: isFullSize ? 0 : theme.spacing(3),
    right: isFullSize ? 0 : theme.spacing(3),
    top: isFullSize ? 0 : "auto",
    left: isFullSize ? 0 : "auto",
    width: isFullSize ? "100vw" : 400,
    height: isFullSize ? "100vh" : 500,
    zIndex: 1300,
    borderRadius: isFullSize ? 0 : theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    boxShadow: theme.shadows[8],
    overflow: "hidden",
    transition: "all 0.3s ease-in-out",
  }),
);

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
}));

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON stringified arguments
  };
}

export interface ChatUIProps {
  /** Whether the chat is open */
  isOpen: boolean;
  /** Array of chat messages */
  messages: ChatMessage[];
  /** Current input value */
  inputValue: string;
  /** Whether a message is being sent */
  isLoading: boolean;
  /** Error message to display */
  error?: string | null;
  /** Welcome message to show when no messages */
  welcomeMessage?: string;
  /** Placeholder text for input */
  inputPlaceholder?: string;
  /** Chat title */
  title?: string;
  /** CSS class name */
  className?: string;
  /** Callback when chat is toggled */
  onToggle: () => void;
  /** Callback when input value changes */
  onInputChange: (value: string) => void;
  /** Callback when send button is clicked */
  onSendMessage: () => void;
  /** Callback when key is pressed in input */
  onKeyPress: (event: React.KeyboardEvent) => void;
  /** Function to format timestamp */
  formatTime?: (timestamp: string) => string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Whether the chat is in full-size mode */
  isFullSize?: boolean;
  /** Callback when full-size toggle is clicked */
  onToggleFullSize?: () => void;
  /** Whether context is enabled */
  isContextEnabled?: boolean;
  /** Callback when context toggle is clicked */
  onToggleContext?: () => void;
  /** Label to display for current context (e.g., "actors #123") */
  contextLabel?: string;
  /** Streaming message content (content_delta accumulation) */
  streamingMessage?: {
    content: string;
    tool_calls?: ToolCall[];
    timestamp: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      isEstimated: boolean;
    } | null;
    thinkingContent?: string;
  } | null;
  /** Provider selector configuration */
  providerSelector?: {
    selectedProvider: string | null;
    onProviderChange: (provider: string) => void;
    selectedModel: string | null;
    onModelChange: (model: string) => void;
    getAuthToken?: () => string | null;
  };
  /** Last used provider information */
  usedProvider?: {
    provider: string;
    model: string;
  } | null;
}

const defaultFormatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * ChatUI Component
 *
 * A presentational component for a floating chat interface.
 * Handles only UI rendering - all logic should be managed by the parent.
 */
export const ChatUI: React.FC<ChatUIProps> = ({
  isOpen,
  messages,
  inputValue,
  isLoading,
  error,
  welcomeMessage = "Welcome! I'm your AI assistant. How can I help you today?",
  inputPlaceholder = "Type your message...",
  title = "AI Assistant",
  className,
  onToggle,
  onInputChange,
  onSendMessage,
  onKeyPress,
  formatTime = defaultFormatTime,
  onRetry,
  isFullSize = false,
  onToggleFullSize,
  isContextEnabled = false,
  onToggleContext,
  contextLabel,
  streamingMessage,
  providerSelector,
  usedProvider,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <div className={className}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <FloatingButton onClick={onToggle} elevation={6}>
          <Icons.PostAdd />
        </FloatingButton>
      )}

      {/* Chat Modal */}
      {isOpen &&
        createPortal(
          <ChatModal isFullSize={isFullSize}>
            <ChatHeader
              title={title}
              isFullSize={isFullSize}
              onToggle={onToggle}
              onToggleFullSize={onToggleFullSize}
            />

            <MessagesContainer>
              {messages.length === 0 && (
                <WelcomeMessage message={welcomeMessage} />
              )}

              {messages.flatMap((message) => {
                const messageComponents: React.ReactElement[] = [];

                if (message.role === "tool") {
                  // Tool messages are standalone
                  messageComponents.push(
                    <ToolMessage
                      key={message.id}
                      message={message}
                      formatTime={formatTime}
                    />,
                  );
                } else {
                  // User or assistant messages
                  if (message.content) {
                    messageComponents.push(
                      <ContentMessage
                        key={message.id}
                        message={message}
                        formatTime={formatTime}
                        copiedMessageId={copiedMessageId}
                        onCopyMessage={(messageId, content) => {
                          void handleCopyMessage(messageId, content);
                        }}
                      />,
                    );
                  }

                  // Add separate message bubbles for each tool call
                  if (
                    message.role === "assistant" &&
                    message.tool_calls &&
                    message.tool_calls.length > 0
                  ) {
                    message.tool_calls.forEach((toolCall, index) => {
                      messageComponents.push(
                        <ToolMessage
                          key={`${message.id}-tool-${toolCall.id}-${index}`}
                          message={{
                            id: toolCall.id,
                            role: "tool",
                            content: JSON.stringify({
                              tool: toolCall.function.name,
                              arguments: toolCall.function.arguments,
                            }),
                            timestamp: message.timestamp,
                            tool_calls: [toolCall],
                          }}
                          formatTime={formatTime}
                        />,
                      );
                    });
                  }
                }

                return messageComponents;
              })}

              {streamingMessage && (
                <StreamingMessage
                  streamingMessage={streamingMessage}
                  formatTime={formatTime}
                />
              )}

              {isLoading && !streamingMessage && <LoadingMessage />}

              <div ref={messagesEndRef} />
            </MessagesContainer>

            {error && <ErrorDisplay error={error} onRetry={onRetry} />}

            <ChatInput
              inputValue={inputValue}
              inputPlaceholder={inputPlaceholder}
              isLoading={isLoading}
              isContextEnabled={isContextEnabled}
              contextLabel={contextLabel}
              onInputChange={onInputChange}
              onKeyPress={onKeyPress}
              onSendMessage={onSendMessage}
              onToggleContext={onToggleContext}
            />

            {providerSelector && (
              <Box sx={{ px: 1.5, pb: 0.75 }}>
                <ProviderSelector
                  selectedProvider={providerSelector.selectedProvider as any}
                  selectedModel={providerSelector.selectedModel}
                  onProviderChange={providerSelector.onProviderChange}
                  onModelChange={providerSelector.onModelChange}
                  getAuthToken={providerSelector.getAuthToken}
                  usedProvider={usedProvider}
                />
              </Box>
            )}
          </ChatModal>,
          document.body,
        )}
    </div>
  );
};

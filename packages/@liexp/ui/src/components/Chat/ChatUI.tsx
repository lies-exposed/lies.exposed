import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { styled } from "../../theme/index.js";
import {
  Box,
  Paper,
  Icons,
  Switch,
  FormControlLabel,
  Typography,
} from "../mui/index.js";
import { AgentSelector, type AgentType } from "./AgentSelector.js";
import { ChatHeader } from "./ChatHeader.js";
import { ChatInput } from "./ChatInput.js";
import { ContentMessage } from "./ContentMessage.js";
import { ErrorDisplay } from "./ErrorDisplay.js";
import { LoadingMessage } from "./LoadingMessage.js";
import { ProviderSelector } from "./ProviderSelector.js";
import { StreamingMessage } from "./StreamingMessage.js";
import { SystemMessage } from "./SystemMessage.js";
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

const ChatModal = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isFullSize",
})<{ isFullSize: boolean }>(({ theme, isFullSize }) => ({
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
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
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
  /** Callback to compact the conversation (summarize and start fresh thread) */
  onCompact?: () => void;
  /** Whether a compact operation is in progress */
  isCompacting?: boolean;
  /** Whether auto-compact is enabled */
  autoCompact?: boolean;
  /** Callback to toggle auto-compact */
  onToggleAutoCompact?: () => void;
  /** Token usage from the last completed message */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    isEstimated: boolean;
  } | null;
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
  /** Agent selector configuration */
  agentSelector?: {
    selectedAgent: AgentType | null;
    onAgentChange: (agent: AgentType) => void;
    getAuthToken?: () => string | null;
  };
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
  agentSelector,
  providerSelector,
  usedProvider,
  onCompact,
  isCompacting,
  autoCompact,
  onToggleAutoCompact,
  tokenUsage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

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
              onCompact={onCompact}
              isCompacting={isCompacting}
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
                } else if (message.role === "system") {
                  // System messages rendered as centered notifications
                  messageComponents.push(
                    <SystemMessage
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
                      />,
                    );
                  }

                  // Add separate message bubbles for each tool call (only when
                  // there are no corresponding role:"tool" messages in the list,
                  // i.e. assistant messages loaded from history that include
                  // tool_calls but no separate tool result messages)
                  if (
                    message.role === "assistant" &&
                    message.tool_calls &&
                    message.tool_calls.length > 0
                  ) {
                    const toolMessageIds = new Set(
                      messages
                        .filter((m) => m.role === "tool" && m.tool_call_id)
                        .map((m) => m.tool_call_id),
                    );
                    message.tool_calls.forEach((toolCall, index) => {
                      // Skip if there's already a dedicated tool result message
                      if (toolMessageIds.has(toolCall.id)) return;
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

            {(agentSelector ??
              providerSelector ??
              onToggleAutoCompact ??
              tokenUsage) && (
              <Box
                sx={{
                  px: 1.5,
                  pb: 0.75,
                  borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                }}
              >
                {agentSelector && (
                  <AgentSelector
                    selectedAgent={agentSelector.selectedAgent}
                    onAgentChange={agentSelector.onAgentChange}
                    getAuthToken={agentSelector.getAuthToken}
                  />
                )}
                {providerSelector && (
                  <ProviderSelector
                    selectedProvider={providerSelector.selectedProvider as any}
                    selectedModel={providerSelector.selectedModel}
                    onProviderChange={providerSelector.onProviderChange}
                    onModelChange={providerSelector.onModelChange}
                    getAuthToken={providerSelector.getAuthToken}
                    usedProvider={usedProvider}
                  />
                )}
                {onToggleAutoCompact && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mt: 0.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!autoCompact}
                          onChange={onToggleAutoCompact}
                        />
                      }
                      label={
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          Auto-compact on context limit
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                    {tokenUsage && (
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem", opacity: 0.7 }}
                      >
                        {tokenUsage.totalTokens.toLocaleString()} tokens
                        {tokenUsage.isEstimated ? " (est.)" : ""}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </ChatModal>,
          document.body,
        )}
    </div>
  );
};

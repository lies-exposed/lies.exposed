import { type UIMessage } from "ai";
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
  /** Array of AI SDK UI messages */
  messages: UIMessage[];
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
  /** Label to display for current context (e.g., "actors #123") */
  contextLabel?: string;
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
  /** List of past conversations for history */
  conversations?: {
    id: string;
    title: string;
    updatedAt: string;
  }[];
  /** Callback when a conversation is selected */
  onSelectConversation?: (conversationId: string) => void;
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
  agentSelector,
  providerSelector,
  usedProvider,
  onCompact,
  isCompacting,
  autoCompact,
  onToggleAutoCompact,
  conversations,
  onSelectConversation,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              conversations={conversations}
              onSelectConversation={onSelectConversation}
            />

            <MessagesContainer>
              {messages.length === 0 && (
                <WelcomeMessage message={welcomeMessage} />
              )}

              {messages.flatMap((message, messageIndex) => {
                const messageComponents: React.ReactElement[] = [];
                const timestamp =
                  typeof (message.metadata as { timestamp?: unknown } | undefined)
                    ?.timestamp === "string"
                    ? String((message.metadata as { timestamp?: string }).timestamp)
                    : new Date().toISOString();

                const toolMessageIds = new Set<string>();

                for (const [partIndex, part] of message.parts.entries()) {
                  if (part.type === "text") {
                    if (!part.text) continue;
                    messageComponents.push(
                      <ContentMessage
                        key={`${message.id}-text-${partIndex}`}
                        message={{
                          id: `${message.id}-text-${partIndex}`,
                          role: message.role,
                          content: part.text,
                          timestamp,
                        }}
                        formatTime={formatTime}
                      />,
                    );
                    continue;
                  }

                  if (part.type === "reasoning") {
                    if (!part.text) continue;
                    messageComponents.push(
                      <SystemMessage
                        key={`${message.id}-reasoning-${partIndex}`}
                        message={{
                          id: `${message.id}-reasoning-${partIndex}`,
                          role: "system",
                          content: part.text,
                          timestamp,
                        }}
                        formatTime={formatTime}
                      />,
                    );
                    continue;
                  }

                  if (part.type === "dynamic-tool") {
                    const args =
                      part.state === "input-available" ||
                      part.state === "output-available" ||
                      part.state === "approval-requested" ||
                      part.state === "approval-responded"
                        ? part.input
                        : {};
                    const result =
                      part.state === "output-available" ? part.output : undefined;
                    toolMessageIds.add(part.toolCallId);
                    messageComponents.push(
                      <ToolMessage
                        key={`${message.id}-dyn-tool-${part.toolCallId}-${partIndex}`}
                        message={{
                          id: `${message.id}-dyn-tool-${part.toolCallId}`,
                          role: "tool",
                          content: JSON.stringify(
                            {
                              tool: part.toolName,
                              arguments: JSON.stringify(args ?? {}),
                              result: result
                                ? JSON.stringify(result)
                                : undefined,
                            },
                            null,
                            2,
                          ),
                          timestamp,
                          tool_call_id: part.toolCallId,
                        }}
                        formatTime={formatTime}
                      />,
                    );
                    continue;
                  }

                  if (part.type.startsWith("tool-")) {
                    const toolName = part.type.replace(/^tool-/, "");
                    const toolCallId =
                      (part as { toolCallId?: string }).toolCallId ??
                      `${message.id}-${partIndex}`;
                    const input =
                      (part as { input?: unknown; args?: unknown }).input ??
                      (part as { input?: unknown; args?: unknown }).args ??
                      {};
                    const output = (part as { output?: unknown }).output;

                    toolMessageIds.add(toolCallId);
                    messageComponents.push(
                      <ToolMessage
                        key={`${message.id}-tool-${toolCallId}-${partIndex}`}
                        message={{
                          id: `${message.id}-tool-${toolCallId}`,
                          role: "tool",
                          content: JSON.stringify(
                            {
                              tool: toolName,
                              arguments: JSON.stringify(input ?? {}),
                              result: output ? JSON.stringify(output) : undefined,
                            },
                            null,
                            2,
                          ),
                          timestamp,
                          tool_call_id: toolCallId,
                          tool_calls: [
                            {
                              id: toolCallId,
                              type: "function",
                              function: {
                                name: toolName,
                                arguments: JSON.stringify(input ?? {}),
                              },
                            } as ToolCall,
                          ],
                        }}
                        formatTime={formatTime}
                      />,
                    );
                  }
                }

                // Show message-only system placeholder if no renderable parts.
                if (messageComponents.length === 0 && message.role === "system") {
                  messageComponents.push(
                    <SystemMessage
                      key={`${message.id}-system-empty-${messageIndex}`}
                      message={{
                        id: `${message.id}-system-empty`,
                        role: "system",
                        content: "System message",
                        timestamp,
                      }}
                      formatTime={formatTime}
                    />,
                  );
                }

                return messageComponents;
              })}

              {isLoading && <LoadingMessage />}

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

            {(agentSelector ?? providerSelector ?? onToggleAutoCompact) && (
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
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {
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
                              Auto-compact
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                      }
                    </Box>
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

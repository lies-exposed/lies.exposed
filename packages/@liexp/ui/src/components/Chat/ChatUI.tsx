import { type ChatMessage } from "@liexp/shared/lib/io/http/Chat.js";
import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { styled } from "../../theme/index.js";
import { MarkdownContent } from "../Common/Markdown/MarkdownContent.js";
import {
  Box,
  CardHeader,
  IconButton,
  TextField,
  Typography,
  Paper,
  Stack,
  Icons,
} from "../mui/index.js";
import { ToolMessageDisplay } from "./ToolMessageDisplay.js";

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

const MessageBubble = styled(Paper)<{ isUser: boolean }>(
  ({ theme, isUser }) => ({
    padding: theme.spacing(1, 2),
    maxWidth: "70%",
    alignSelf: isUser ? "flex-end" : "flex-start",
    backgroundColor: isUser
      ? theme.palette.primary.main
      : theme.palette.grey[200],
    color: isUser
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    borderRadius: theme.spacing(2),
    position: "relative",
    "&:hover .copy-button": {
      opacity: 1,
    },
  }),
);

export interface ToolCall {
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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            {/* Header */}
            <CardHeader
              title={
                <Typography variant="h6" component="div">
                  {title}
                </Typography>
              }
              action={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {onToggleFullSize && (
                    <IconButton
                      onClick={onToggleFullSize}
                      title={isFullSize ? "Minimize" : "Maximize"}
                    >
                      {isFullSize ? (
                        <Icons.OpenInFull
                          sx={{ transform: "rotate(180deg)" }}
                        />
                      ) : (
                        <Icons.OpenInFull />
                      )}
                    </IconButton>
                  )}
                  <IconButton onClick={onToggle} title="Close">
                    <Icons.Close />
                  </IconButton>
                </Box>
              }
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                "& .MuiCardHeader-action": {
                  color: "inherit",
                },
              }}
            />

            {/* Messages */}
            <MessagesContainer>
              {messages.length === 0 && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {welcomeMessage}
                  </Typography>
                </Box>
              )}

              {messages.map((message) => (
                <Stack
                  key={message.id}
                  direction="row"
                  justifyContent={
                    message.role === "user" ? "flex-end" : "flex-start"
                  }
                >
                  <MessageBubble isUser={message.role === "user"}>
                    {message.role === "tool" ? (
                      <ToolMessageDisplay message={message} />
                    ) : (
                      <MarkdownContent content={message.content} />
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          fontSize: "0.7rem",
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                      {message.role === "assistant" && (
                        <IconButton
                          className="copy-button"
                          size="small"
                          onClick={() =>
                            void handleCopyMessage(message.id, message.content)
                          }
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            backgroundColor: "rgba(0, 0, 0, 0.05)",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.1)",
                            },
                            ml: 1,
                          }}
                          title="Copy message"
                        >
                          {copiedMessageId === message.id ? (
                            <Icons.CheckBox sx={{ fontSize: "1rem" }} />
                          ) : (
                            <Icons.Copy sx={{ fontSize: "1rem" }} />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </MessageBubble>
                </Stack>
              ))}

              {isLoading && (
                <MessageBubble isUser={false}>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    AI is thinking...
                  </Typography>
                </MessageBubble>
              )}

              <div ref={messagesEndRef} />
            </MessagesContainer>

            {/* Error Display */}
            {error && (
              <Box
                sx={{
                  p: 1,
                  backgroundColor: "#ffebee",
                  color: "#c62828",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {error}
                </Typography>
                {onRetry && (
                  <IconButton
                    size="small"
                    onClick={onRetry}
                    sx={{
                      color: "#c62828",
                      "&:hover": { backgroundColor: "rgba(198, 40, 40, 0.1)" },
                    }}
                    title="Retry sending message"
                  >
                    <Icons.Refresh sx={{ fontSize: "1rem" }} />
                  </IconButton>
                )}
              </Box>
            )}

            {/* Input */}
            <Box
              sx={{
                p: 1,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.background.paper,
              }}
            >
              {isContextEnabled && contextLabel && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    mb: 1,
                    backgroundColor: (theme) => theme.palette.primary.light,
                    color: (theme) => theme.palette.primary.contrastText,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    alignSelf: "flex-start",
                  }}
                >
                  <Icons.PinOutlined sx={{ fontSize: "0.875rem" }} />
                  <Typography variant="caption">{contextLabel}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyPress={onKeyPress}
                  disabled={isLoading}
                  variant="outlined"
                  size="small"
                />
                {onToggleContext && (
                  <IconButton
                    onClick={onToggleContext}
                    title={
                      isContextEnabled ? "Disable Context" : "Enable Context"
                    }
                    sx={{
                      color: isContextEnabled
                        ? (theme) => theme.palette.primary.main
                        : (theme) => theme.palette.action.disabled,
                    }}
                  >
                    <Icons.PinOutlined />
                  </IconButton>
                )}
                <IconButton
                  onClick={onSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  color="primary"
                >
                  <Icons.ArrowUp />
                </IconButton>
              </Box>
            </Box>
          </ChatModal>,
          document.body,
        )}
    </div>
  );
};

import {
  Box,
  CardHeader,
  IconButton,
  TextField,
  Typography,
  Paper,
  Icons,
} from "@liexp/ui/lib/components/mui/index.js";
import { styled } from "@liexp/ui/lib/theme/index.js";
import React, { useState, useRef, useEffect } from "react";
import { useAPIAgent } from "../../hooks/useAPIAgent.js";

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

const ChatModal = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  width: 400,
  height: 500,
  zIndex: 1300,
  borderRadius: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  boxShadow: theme.shadows[8],
  overflow: "hidden",
}));

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
  }),
);

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "flex-end",
}));

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentClient = useAPIAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
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
      // Log error for debugging (could be replaced with proper logging service)
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

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={className}>
      {/* Floating Chat Button */}
      {!isOpen && (
        <FloatingButton onClick={handleToggleChat} elevation={6}>
          <Icons.PostAdd />
        </FloatingButton>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <ChatModal>
          {/* Header */}
          <CardHeader
            title={
              <Typography variant="h6" component="div">
                AI Assistant
              </Typography>
            }
            action={
              <IconButton onClick={handleToggleChat}>
                <Icons.Close />
              </IconButton>
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
                  Welcome! I'm your AI assistant for the lies.exposed platform.
                  Ask me about actors, events, fact-checking, or anything else
                  you need help with.
                </Typography>
              </Box>
            )}

            {messages.map((message) => (
              <Box key={message.id}>
                <MessageBubble isUser={message.role === "user"}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: "0.7rem",
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </MessageBubble>
              </Box>
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
            <Box sx={{ p: 1, backgroundColor: "#ffebee", color: "#c62828" }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          {/* Input */}
          <InputContainer>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              size="small"
            />
            <IconButton
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={!inputValue.trim() || isLoading}
              color="primary"
            >
              <Icons.ArrowUp />
            </IconButton>
          </InputContainer>
        </ChatModal>
      )}
    </div>
  );
};

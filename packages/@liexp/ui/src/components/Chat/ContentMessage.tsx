import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React, { useState, useCallback } from "react";
import { MarkdownContent } from "../Common/Markdown/MarkdownContent.js";
import { Box, IconButton, Icons, Stack, Typography } from "../mui/index.js";
import { MessageBubble } from "./MessageBubble.js";

interface ContentMessageProps {
  message: ChatMessage;
  formatTime: (timestamp: string) => string;
}

export const ContentMessage: React.FC<ContentMessageProps> = React.memo(({
  message,
  formatTime,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  return (
    <Stack
      direction="row"
      justifyContent={message.role === "user" ? "flex-end" : "flex-start"}
    >
      <MessageBubble isUser={message.role === "user"}>
        <MarkdownContent content={message.content} />
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
              onClick={handleCopy}
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
              {copied ? (
                <Icons.CheckBox sx={{ fontSize: "1rem" }} />
              ) : (
                <Icons.Copy sx={{ fontSize: "1rem" }} />
              )}
            </IconButton>
          )}
        </Box>
      </MessageBubble>
    </Stack>
  );
});

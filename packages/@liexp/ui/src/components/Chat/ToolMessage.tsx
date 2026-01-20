import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React from "react";
import { Box, Stack, Typography } from "../mui/index.js";
import { ToolMessageDisplay } from "./ToolMessageDisplay.js";

interface ToolMessageProps {
  message: ChatMessage;
  formatTime: (timestamp: string) => string;
}

export const ToolMessage: React.FC<ToolMessageProps> = ({
  message,
  formatTime,
}) => {
  return (
    <Stack direction="row" justifyContent="flex-start">
      <Box sx={{ maxWidth: "70%" }}>
        <ToolMessageDisplay message={message} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
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
        </Box>
      </Box>
    </Stack>
  );
};

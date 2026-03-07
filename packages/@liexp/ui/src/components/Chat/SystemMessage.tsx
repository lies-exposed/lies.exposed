import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React from "react";
import { Box, Typography } from "../mui/index.js";

interface SystemMessageProps {
  message: ChatMessage;
  formatTime: (timestamp: string) => string;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({
  message,
  formatTime,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        my: 0.5,
      }}
    >
      <Box
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.05)",
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          maxWidth: "80%",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            fontStyle: "italic",
            color: "text.secondary",
            textAlign: "center",
            fontSize: "0.75rem",
          }}
        >
          {message.content}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ opacity: 0.5, fontSize: "0.65rem", mt: 0.25 }}
      >
        {formatTime(message.timestamp)}
      </Typography>
    </Box>
  );
};

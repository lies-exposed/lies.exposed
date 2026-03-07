import { type ChatMessage } from "@liexp/io/lib/http/Chat.js";
import React from "react";
import { Box } from "../mui/index.js";
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
    <Box sx={{ width: "100%", maxWidth: "80%" }}>
      <ToolMessageDisplay message={message} formatTime={formatTime} />
    </Box>
  );
};

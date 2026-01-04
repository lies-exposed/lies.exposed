import React from "react";
import { Typography } from "../mui/index.js";
import { MessageBubble } from "./MessageBubble.js";

export const LoadingMessage: React.FC = () => {
  return (
    <MessageBubble isUser={false}>
      <Typography variant="body2" sx={{ fontStyle: "italic" }}>
        AI is thinking...
      </Typography>
    </MessageBubble>
  );
};

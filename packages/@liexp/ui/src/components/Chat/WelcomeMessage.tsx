import React from "react";
import { Box, Typography } from "../mui/index.js";

interface WelcomeMessageProps {
  message: string;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ message }) => {
  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

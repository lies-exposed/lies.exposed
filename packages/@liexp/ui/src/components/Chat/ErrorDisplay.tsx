import React from "react";
import { Box, IconButton, Typography, Icons } from "../mui/index.js";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
}) => {
  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: (theme) => theme.palette.error.light,
        color: (theme) => theme.palette.error.dark,
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
            color: (theme) => theme.palette.error.dark,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.error.main,
              color: (theme) => theme.palette.error.contrastText,
            },
          }}
          title="Retry sending message"
        >
          <Icons.Refresh sx={{ fontSize: "1rem" }} />
        </IconButton>
      )}
    </Box>
  );
};

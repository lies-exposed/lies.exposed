import React from "react";
import {
  Box,
  CardHeader,
  IconButton,
  Typography,
  Icons,
} from "../mui/index.js";

interface ChatHeaderProps {
  title: string;
  isFullSize: boolean;
  onToggle: () => void;
  onToggleFullSize?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isFullSize,
  onToggle,
  onToggleFullSize,
}) => {
  return (
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
                <Icons.OpenInFull sx={{ transform: "rotate(180deg)" }} />
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
  );
};

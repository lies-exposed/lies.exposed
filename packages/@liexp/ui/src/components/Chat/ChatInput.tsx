import React from "react";
import { Box, IconButton, TextField, Typography, Icons } from "../mui/index.js";

interface ChatInputProps {
  inputValue: string;
  inputPlaceholder: string;
  isLoading: boolean;
  isContextEnabled: boolean;
  contextLabel?: string;
  onInputChange: (value: string) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onToggleContext?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  inputPlaceholder,
  isLoading,
  isContextEnabled,
  contextLabel,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onToggleContext,
}) => {
  return (
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
            title={isContextEnabled ? "Disable Context" : "Enable Context"}
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
  );
};

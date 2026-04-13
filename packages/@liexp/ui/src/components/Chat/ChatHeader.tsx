import React, { useState } from "react";
import {
  Box,
  CardHeader,
  IconButton,
  Typography,
  Icons,
  Menu,
  MenuItem,
  ListItemText,
} from "../mui/index.js";

interface ChatHeaderProps {
  title: string;
  isFullSize: boolean;
  onToggle: () => void;
  onToggleFullSize?: () => void;
  onCompact?: () => void;
  isCompacting?: boolean;
  conversations?: {
    id: string;
    title: string;
    updatedAt: string;
  }[];
  onSelectConversation?: (conversationId: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isFullSize,
  onToggle,
  onToggleFullSize,
  onCompact,
  isCompacting,
  conversations = [],
  onSelectConversation,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectConversation = (id: string) => {
    handleCloseMenu();
    onSelectConversation?.(id);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <CardHeader
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {conversations.length > 0 && (
            <>
              <IconButton
                size="small"
                color="inherit"
                onClick={handleOpenMenu}
                title="History"
                sx={{ ml: 1 }}
              >
                <Icons.HistoryIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                  sx: { maxHeight: 300, width: 250 },
                }}
              >
                {conversations.map((conv) => (
                  <MenuItem
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <ListItemText
                      primary={conv.title || "Untitled"}
                      secondary={formatDate(conv.updatedAt)}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>
      }
      action={
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {onCompact && (
            <IconButton
              color="inherit"
              onClick={onCompact}
              disabled={isCompacting}
              title="Compact conversation (summarize and start fresh thread)"
            >
              <Icons.Compress />
            </IconButton>
          )}
          {onToggleFullSize && (
            <IconButton
              color="inherit"
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
          <IconButton color="inherit" onClick={onToggle} title="Close">
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

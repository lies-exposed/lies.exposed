import { AppBar } from "@liexp/ui/lib/components/admin/react-admin.js";
import { ChatIcon } from "@liexp/ui/lib/components/mui/icons.js";
import { Box, IconButton } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";
import { useChatPanelContext } from "./ChatPanelContext.js";
import { ThemeSwitcher } from "./ThemeSwitcher.js";

/**
 * Custom AppBar component for admin layout
 * Extends react-admin's default AppBar with theme switcher and chat toggle
 */
export const CustomAppBar: React.FC = () => {
  const { onToggleChat } = useChatPanelContext() ?? {
    onToggleChat: () => {},
  };

  return (
    <AppBar>
      <Box sx={{ flex: 1 }} />
      <IconButton onClick={onToggleChat} color="inherit" title="AI Chat">
        <ChatIcon />
      </IconButton>
      <ThemeSwitcher />
    </AppBar>
  );
};

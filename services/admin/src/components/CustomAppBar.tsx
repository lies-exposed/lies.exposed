import { AppBar } from "@liexp/ui/lib/components/admin/react-admin.js";
import { ChatIcon } from "@liexp/ui/lib/components/mui/icons.js";
import {
  Box,
  IconButton,
  Tooltip,
} from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher.js";
import { useChatPanel } from "./chat/ChatPanelContext.js";

/**
 * Custom AppBar component for admin layout
 * Extends react-admin's default AppBar with theme switcher and chat toggle on the right
 */
export const CustomAppBar: React.FC = () => {
  const { isOpen, toggle } = useChatPanel();

  return (
    <AppBar>
      <Box sx={{ flex: 1 }} />
      <Tooltip title={isOpen ? "Close chat" : "Open chat"}>
        <IconButton
          color="inherit"
          onClick={toggle}
          size="small"
          aria-label="chat toggle"
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
      <ThemeSwitcher />
    </AppBar>
  );
};

import { AppBar } from "@liexp/ui/lib/components/admin/react-admin.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";
import { ThemeSwitcher } from "./ThemeSwitcher.js";

/**
 * Custom AppBar component for admin layout
 * Extends react-admin's default AppBar with theme switcher on the right
 */
export const CustomAppBar: React.FC = () => {
  return (
    <AppBar>
      <Box sx={{ flex: 1 }} />
      <ThemeSwitcher />
    </AppBar>
  );
};

import {
  DarkMode,
  LightMode,
  SettingsBrightness,
} from "@liexp/ui/lib/components/mui/icons.js";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@liexp/ui/lib/components/mui/index.js";
import {
  type ThemeMode,
  useThemeMode,
} from "@liexp/ui/lib/context/ThemeContext.js";
import * as React from "react";

/**
 * ThemeSwitcher component for admin app bar
 * Allows users to toggle between light, dark, and system theme modes
 */
export const ThemeSwitcher: React.FC = () => {
  const { mode, setMode, resolvedMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  const getTooltipLabel = () => {
    switch (mode) {
      case "light":
        return "Light theme";
      case "dark":
        return "Dark theme";
      case "system":
        return `System theme (${resolvedMode})`;
      default:
        return "Toggle theme";
    }
  };

  const getIcon = () => {
    switch (resolvedMode) {
      case "dark":
        return <DarkMode />;
      case "light":
      default:
        return <LightMode />;
    }
  };

  return (
    <>
      <Tooltip title={getTooltipLabel()}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          size="small"
          aria-label="theme switcher"
          aria-haspopup="true"
          aria-controls="theme-menu"
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => handleModeChange("light")}
          selected={mode === "light"}
        >
          <ListItemIcon>
            <LightMode fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange("dark")}
          selected={mode === "dark"}
        >
          <ListItemIcon>
            <DarkMode fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange("system")}
          selected={mode === "system"}
        >
          <ListItemIcon>
            <SettingsBrightness fontSize="small" />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

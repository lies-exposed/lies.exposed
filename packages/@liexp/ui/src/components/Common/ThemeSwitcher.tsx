import * as React from "react";
import { useThemeMode } from "../../context/ThemeContext.js";
import { IconButton, Icons, Tooltip } from "../mui/index.js";

export interface ThemeSwitcherProps {
  /**
   * Size of the icon button
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";
  /**
   * Color of the icon button
   * @default 'inherit'
   */
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  /**
   * Whether to show the tooltip
   * @default true
   */
  showTooltip?: boolean;
  /**
   * Additional className for styling
   */
  className?: string;
}

/**
 * ThemeSwitcher component that allows users to toggle between light, dark, and system themes
 * Displays current theme mode with icon and cycles through available modes on click
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  size = "medium",
  color = "inherit",
  showTooltip = true,
  className,
}) => {
  const { mode, setMode } = useThemeMode();

  const handleClick = (): void => {
    // Cycle through theme modes: light -> dark -> system -> light
    const modeOrder: ("light" | "dark" | "system")[] = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = modeOrder.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modeOrder.length;
    setMode(modeOrder[nextIndex]);
  };

  const getIcon = (): React.ReactElement => {
    switch (mode) {
      case "light":
        return <Icons.LightMode />;
      case "dark":
        return <Icons.DarkMode />;
      case "system":
        return <Icons.SettingsBrightness />;
    }
  };

  const getTooltipTitle = (): string => {
    switch (mode) {
      case "light":
        return "Light mode - Click to switch to Dark mode";
      case "dark":
        return "Dark mode - Click to switch to System preference";
      case "system":
        return "System preference - Click to switch to Light mode";
    }
  };

  const button = (
    <IconButton
      className={className}
      onClick={handleClick}
      size={size}
      color={color}
      aria-label="toggle theme"
    >
      {getIcon()}
    </IconButton>
  );

  if (!showTooltip) {
    return button;
  }

  return <Tooltip title={getTooltipTitle()}>{button}</Tooltip>;
};

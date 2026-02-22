// @liexp/ui/src/theme/styleUtils.ts
// Reusable style patterns to prevent CSS bloat and duplication

import { type SxProps, type Theme } from "./index.js";

// Spacing constants exported with semantic names to avoid duplication
export const SPACING_XS = "3px";
export const SPACING_SM = "4px";
export const SPACING_BASE = "6px";
export const SPACING_MD = "8px";
export const SPACING_LG = "10px";
export const SPACING_XL = "12px";
export const PADDING_COMPACT = "3px 6px";
export const PADDING_BADGE = "4px 6px";
export const PADDING_SM = "8px 8px";
export const PADDING_MD = "10px 10px";
export const PADDING_LG = "24px 24px 24px 32px";
export const MARGIN_XS = "4px 4px";
export const MARGIN_SM = "0 4px";
export const MARGIN_MD = "10px 10px";
export const MARGIN_BOTTOM_SM = "0 0 10px 0";
export const MARGIN_LEFT_SM = "0 0 0 4px";
export const NODE_MIN_HEIGHT = 34;
export const NODE_MIN_WIDTH = 130;
export const NODE_MAX_WIDTH = 150;
export const AVATAR_SIZE = 26;
export const BADGE_BORDER_RADIUS = 3;
export const NODE_BORDER_RADIUS = 6;
export const SANKEY_GRAPH_MAX_HEIGHT = 800;
export const SANKEY_GRAPH_MARGIN = { vertical: 40, horizontal: 40 };
export const FONT_SIZE_BADGE = 8;
export const FONT_SIZE_LEGEND = 10;
export const FONT_SIZE_NODE = 11;

// Additional aliases for specific use cases
export const SPACING_3XL = "24px";
export const SPACING_4XL = "32px";

/**
 * FLEXBOX UTILITIES
 * Common flex layouts - prevents duplicating flex properties
 */

export const flexCenter: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const flexBetween: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

export const flexStart: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
};

export const flexColumn: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

export const flexColumnCenter: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

/**
 * TEXT UTILITIES
 * Common text patterns - ellipsis, truncation, etc.
 */

export const ellipsisText: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

/**
 * Truncate text to N lines
 * @param lines - Number of lines to show (default 2)
 * @returns SxProps for line clamping
 */
export const truncateLines = (lines = 2): SxProps<Theme> => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

/**
 * TEXT STYLING
 * Common text styles
 */

export const mutedText: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.body2.fontSize,
});

export const captionText: SxProps<Theme> = (theme: Theme) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.caption.fontSize,
  fontWeight: 400,
});

/**
 * CARD UTILITIES
 * Reusable card styles - hover effects, shadows, etc.
 */

export const baseCard: SxProps<Theme> = {
  borderRadius: 1,
  transition: "all 200ms ease-in-out",
};

export const elevatedCard: SxProps<Theme> = {
  ...baseCard,
  boxShadow: 1,
  "&:hover": {
    boxShadow: 4,
  },
};

export const outlinedCard: SxProps<Theme> = (theme: Theme) => ({
  ...baseCard,
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: 2,
  },
});

/**
 * IMAGE UTILITIES
 * Common image container patterns
 */

export const aspectVideo: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  paddingBottom: "56.25%", // 16:9
  overflow: "hidden",
  borderRadius: 1,
};

export const aspectSquare: SxProps<Theme> = {
  position: "relative",
  width: "100%",
  paddingBottom: "100%",
  overflow: "hidden",
  borderRadius: 1,
};

export const coverImage: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * BUTTON UTILITIES
 * Common button styles - sizes, states, etc.
 */

export const touchFriendlyButton: SxProps<Theme> = {
  minHeight: 44,
  minWidth: 44,
  padding: "10px 16px",
};

export const fullWidthButton: SxProps<Theme> = {
  ...touchFriendlyButton,
  width: "100%",
};

export const smallButton: SxProps<Theme> = {
  minHeight: 32,
  minWidth: 32,
  padding: "4px 8px",
  fontSize: "0.75rem",
};

/**
 * FOCUS STATES
 * Accessibility - visible focus for keyboard navigation
 */

export const focusStyle = (theme: Theme): SxProps<Theme> => ({
  "&:focus-visible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: "2px",
  },
});

/**
 * INPUT UTILITIES
 * Form input patterns - focus, error states, etc.
 */

export const inputFocusStyle = (theme: Theme): SxProps<Theme> => ({
  "&:focus": {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
  },
});

/**
 * OVERLAY UTILITIES
 * Common overlay patterns - image overlays, modals, etc.
 */

export const darkOverlay: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
};

export const gradientOverlay: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)",
};

/**
 * RESPONSIVE UTILITIES
 * Helper function to create responsive styles
 */

export const createResponsiveStyle = (
  mobile: SxProps<Theme>,
  tablet?: SxProps<Theme>,
  desktop?: SxProps<Theme>,
  theme?: Theme,
): SxProps<Theme> => {
  return {
    ...mobile,
    ...(tablet &&
      theme && {
        [theme.breakpoints.up("md")]: tablet,
      }),
    ...(desktop &&
      theme && {
        [theme.breakpoints.up("lg")]: desktop,
      }),
  };
};

/**
 * SPACING HELPERS
 * Consistent spacing patterns
 */

export const spacingX = (theme: Theme, multiplier: number): string => {
  return theme.spacing(multiplier);
};

export const spacingY = (theme: Theme, multiplier: number): string => {
  return theme.spacing(multiplier);
};

/**
 * ANIMATION UTILITIES
 * Common transition patterns
 */

export const smoothTransition = (
  properties: string[] = ["all"],
): SxProps<Theme> => ({
  transition: `${properties.join(", ")} 200ms ease-in-out`,
});

export const hoverScale = (scale = 1.05): SxProps<Theme> => ({
  ...smoothTransition(["transform"]),
  "&:hover": {
    transform: `scale(${scale})`,
  },
});

export const hoverShadow: SxProps<Theme> = {
  ...smoothTransition(["box-shadow"]),
  "&:hover": {
    boxShadow: 4,
  },
};

/**
 * SCROLL UTILITIES
 * Scrolling behavior patterns
 */

export const hideScrollbar: SxProps<Theme> = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

export const customScrollbar: SxProps<Theme> = (theme: Theme) => ({
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.palette.action.hover} transparent`,
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.action.hover,
    borderRadius: "3px",
  },
});

/**
 * LAYOUT UTILITIES
 * Common layout patterns
 */

export const fullWidth: SxProps<Theme> = {
  width: "100%",
};

export const fullHeight: SxProps<Theme> = {
  height: "100%",
};

export const fullScreen: SxProps<Theme> = {
  width: "100%",
  height: "100%",
};

export const containerMax: SxProps<Theme> = {
  maxWidth: "100%",
  width: "100%",
  margin: "0 auto",
};

export const absoluteFill: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/**
 * MOBILE UTILITIES
 * Mobile-specific patterns
 */

export const mobileOnly: SxProps<Theme> = (theme: Theme) => ({
  display: "block",
  [theme.breakpoints.up("sm")]: {
    display: "none",
  },
});

export const desktopOnly: SxProps<Theme> = (theme: Theme) => ({
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "block",
  },
});

/**
 * GRID UTILITIES
 * Common grid patterns
 */

export const gridAutoFit = (minWidth = "200px"): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
  gap: 2,
});

export const gridAutoFill = (minWidth = "200px"): SxProps<Theme> => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
  gap: 2,
});

/**
 * COMBINATION PATTERNS
 * Common patterns combining multiple utilities
 */

export const cardWithHover: SxProps<Theme> = {
  ...baseCard,
  ...elevatedCard,
  cursor: "pointer",
};

export const flexCenterContainer: SxProps<Theme> = {
  ...flexColumnCenter,
  ...fullScreen,
};

export const responsiveImage: SxProps<Theme> = {
  ...fullWidth,
  height: "auto",
  display: "block",
};

/**
 * DEPRECATED (replaced by theme tokens)
 * These are here to catch old patterns during migration
 */

/**
 * @deprecated Use theme.palette.primary.main instead
 */
export const primaryColor = (theme: Theme): string =>
  theme.palette.primary.main;

/**
 * @deprecated Use theme.spacing(n) instead
 */
export const defaultSpacing = (theme: Theme): string => theme.spacing(2);

/**
 * Get relationship color from theme palette.
 * Used for EntitreeGraph and relationship visualizations.
 */
export const getRelationshipColor = (
  theme: Theme,
  relationType: "parent_child" | "spouse" | "partner" | "sibling",
): string => {
  const relationshipPalette = (theme.palette as any).relationship;
  const colorMap = {
    parent_child: relationshipPalette.parent_child,
    spouse: relationshipPalette.spouse,
    partner: relationshipPalette.partner,
    sibling: relationshipPalette.sibling,
  };
  return colorMap[relationType] ?? relationshipPalette.parent_child;
};

// BookCard.styles.ts
// Extracted and reusable styles for BookCard component

import { type SxProps, type Theme } from "../../../theme/index.js";
import { cardVariants } from "../../../theme/variants.js";

/**
 * Card action area - full height flex container with column direction
 */
export const cardActionAreaSx: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "action.hover",
  },
};

/**
 * Media container - responsive image height with max constraint
 */
export const mediaContainerSx: SxProps<Theme> = {
  height: { xs: 150, sm: 180, md: 200 },
  width: "100%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
};

/**
 * Media image - full width, cover fit
 */
export const mediaImageSx: SxProps<Theme> = {
  height: "100%",
  width: "100%",
  objectFit: "cover",
  backgroundColor: "action.hover",
};

/**
 * Stack wrapper - grows to fill available space
 */
export const contentStackSx: SxProps<Theme> = {
  flexGrow: 2,
  display: "flex",
  flexDirection: "column",
};

/**
 * Card header title - consistent font sizing
 */
export const cardHeaderTitleSx: SxProps<Theme> = {
  fontSize: "1rem",
  marginBottom: 0,
};

/**
 * Card content - minimal padding and flex layout
 */
export const cardContentSx: SxProps<Theme> = {
  paddingTop: 0,
  paddingBottom: 0,
  display: "flex",
  flexGrow: 2,
  width: "100%",
};

/**
 * Inner content stack - vertical alignment with spacing
 */
export const innerContentStackSx: SxProps<Theme> = {
  alignItems: "center",
  flexDirection: "column",
  justifyItems: "center",
  spacing: 1,
  width: "100%",
};

/**
 * Header row - date and authors side-by-side
 */
export const headerRowSx: SxProps<Theme> = {
  flexDirection: "row",
  spacing: 1,
  alignItems: "center",
  justifyItems: "space-between",
  justifyContent: "space-between",
  width: "100%",
};

/**
 * Date column - flex-1 to share space
 */
export const dateColumnSx: SxProps<Theme> = {
  flex: 1,
};

/**
 * Authors column - right-aligned with flex-1
 */
export const authorsColumnSx: SxProps<Theme> = {
  flexDirection: "row",
  justifyContent: "flex-end",
  flex: 1,
};

/**
 * Excerpt container - line-clamped text
 */
export const excerptContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
};

/**
 * Card styling - combines base elevated style with proper sizing
 */
export const cardSx: SxProps<Theme> = {
  ...cardVariants.elevated,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  minHeight: { xs: "250px", sm: "300px", md: "350px" },
};

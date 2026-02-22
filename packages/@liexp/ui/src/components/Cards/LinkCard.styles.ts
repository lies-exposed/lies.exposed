// LinkCard.styles.ts
// Extracted and reusable styles for LinkCard component

import { type SxProps, type Theme } from "../../theme/index.js";

/**
 * Card container - flex layout with responsive direction
 */
export const getCardContainerSx = (variant: "horizontal" | "vertical") =>
  ({
    display: "flex",
    width: "100%",
    flexDirection: variant === "horizontal" ? "row" : "column",
    height: "100%",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      boxShadow: 2,
      transform: "translateY(-2px)",
    },
  }) as const;

/**
 * Media image - responsive sizing based on layout
 */
export const getMediaImageSx = (variant: "horizontal" | "vertical") =>
  ({
    height: 200,
    display: "flex",
    maxWidth: variant === "horizontal" ? 300 : "100%",
    flexGrow: 0,
    flexShrink: 1,
    objectFit: "cover",
    backgroundColor: "action.hover",
  }) as const;

/**
 * Content stack - grows to fill available space
 */
export const contentStackSx: SxProps<Theme> = {
  flexDirection: "column",
  flexGrow: 3,
  flexShrink: 0,
  gap: 2,
};

/**
 * Description container - text truncation
 */
export const descriptionSx: SxProps<Theme> = {
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/**
 * Card actions - button container styling
 */
export const cardActionsSx: SxProps<Theme> = {
  display: "flex",
  gap: 1,
  padding: { xs: 1, sm: 2 },
  borderTop: "1px solid",
  borderColor: "divider",
};

/**
 * Open link button - icon button styling
 */
export const openButtonSx: SxProps<Theme> = {
  minHeight: { xs: "44px", sm: "40px" },
  minWidth: { xs: "44px", sm: "40px" },
  padding: { xs: "8px", sm: "4px" },
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "primary.light",
  },
};

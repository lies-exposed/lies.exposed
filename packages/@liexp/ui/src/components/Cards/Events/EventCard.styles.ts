// EventCard.styles.ts
// Extracted and reusable styles for EventCard component

import { type SxProps, type Theme } from "../../../theme/index.js";
import { cardVariants } from "../../../theme/variants.js";

/**
 * Card action area wrapper - ensures proper flex layout
 */
export const cardActionAreaSx: SxProps<Theme> = {
  height: "100%",
  display: "flex",
  alignItems: "flex-start",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: "action.hover",
  },
};

/**
 * Main card container - vertical or horizontal layout
 */
export const getCardContainerSx = (isVertical: boolean) =>
  ({
    direction: isVertical ? "column" : "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
    gap: { xs: 1, sm: 2 },
  }) as const;

/**
 * Media wrapper - handles responsive sizing
 */
export const getMediaWrapperSx = (isVertical: boolean) =>
  ({
    display: "flex",
    width: isVertical ? "100%" : { xs: "120px", sm: "150px", md: "180px" },
    flexDirection: "row",
    flexShrink: 0,
    overflow: "hidden",
  }) as const;

/**
 * Media image - responsive sizing with proper aspect ratio
 */
export const getMediaImageSx = (isVertical: boolean, maxHeight?: number) =>
  ({
    height: maxHeight ?? { xs: 150, sm: 150, md: 180 },
    width: isVertical ? "100%" : { xs: "120px", sm: "150px", md: "180px" },
    objectFit: "cover",
    backgroundColor: "action.hover",
  }) as const;

/**
 * Content wrapper - grows to fill available space
 */
export const contentWrapperSx = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 2,
  gap: 1,
} as const satisfies SxProps<Theme>;

/**
 * Excerpt container - limits height and handles overflow
 */
export const excerptContainerSx: SxProps<Theme> = {
  maxHeight: { xs: 80, sm: 100, md: 120 },
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/**
 * Relations container - flex row for actors, groups, keywords
 */
export const relationsContainerSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: { xs: 0.5, sm: 1 },
  paddingTop: { xs: 0.5, sm: 1 },
  borderTop: "1px solid",
  borderColor: "divider",
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
  minHeight: { xs: "200px", sm: "250px", md: "300px" },
};

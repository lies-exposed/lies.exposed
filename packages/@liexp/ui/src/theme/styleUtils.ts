// @liexp/ui/src/theme/styleUtils.ts
// Reusable style patterns to prevent CSS bloat and duplication

import { SxProps, Theme } from '@mui/material/styles';
import { spacingConstants } from './index.js';

// Re-export spacing constants for convenience
export const {
  XS,
  SM,
  BASE,
  MD,
  LG,
  XL,
  PADDING_COMPACT,
  PADDING_BADGE,
  PADDING_SM,
  PADDING_MD,
  PADDING_LG,
  MARGIN_XS,
  MARGIN_SM,
  MARGIN_MD,
  MARGIN_BOTTOM_SM,
  MARGIN_LEFT_SM,
  NODE_MIN_HEIGHT,
  NODE_MIN_WIDTH,
  NODE_MAX_WIDTH,
  AVATAR_SIZE,
  BADGE_BORDER_RADIUS,
  NODE_BORDER_RADIUS,
  SANKEY_GRAPH_MAX_HEIGHT,
  SANKEY_GRAPH_MARGIN,
  FONT_SIZE_BADGE,
  FONT_SIZE_LEGEND,
  FONT_SIZE_NODE,
} = spacingConstants;

// Convenient aliases for common spacing patterns
export const SPACING_BASE = BASE;
export const SPACING_LG = LG;
export const SPACING_3XL = spacingConstants["3XL"];
export const SPACING_4XL = spacingConstants["4XL"];

/**
 * FLEXBOX UTILITIES
 * Common flex layouts - prevents duplicating flex properties
 */

export const flexCenter: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const flexBetween: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const flexStart: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
};

export const flexColumn: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
};

export const flexColumnCenter: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

/**
 * TEXT UTILITIES
 * Common text patterns - ellipsis, truncation, etc.
 */

export const ellipsisText: SxProps<Theme> = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Truncate text to N lines
 * @param lines - Number of lines to show (default 2)
 * @returns SxProps for line clamping
 */
export const truncateLines = (lines: number = 2): SxProps<Theme> => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
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
  transition: 'all 200ms ease-in-out',
};

export const elevatedCard: SxProps<Theme> = {
  ...baseCard,
  boxShadow: 1,
  '&:hover': {
    boxShadow: 4,
  },
};

export const outlinedCard: SxProps<Theme> = (theme: Theme) => ({
  ...baseCard,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: 2,
  },
});

/**
 * IMAGE UTILITIES
 * Common image container patterns
 */

export const aspectVideo: SxProps<Theme> = {
  position: 'relative',
  width: '100%',
  paddingBottom: '56.25%', // 16:9
  overflow: 'hidden',
  borderRadius: 1,
};

export const aspectSquare: SxProps<Theme> = {
  position: 'relative',
  width: '100%',
  paddingBottom: '100%',
  overflow: 'hidden',
  borderRadius: 1,
};

export const coverImage: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

/**
 * BUTTON UTILITIES
 * Common button styles - sizes, states, etc.
 */

export const touchFriendlyButton: SxProps<Theme> = {
  minHeight: 44,
  minWidth: 44,
  padding: '10px 16px',
};

export const fullWidthButton: SxProps<Theme> = {
  ...touchFriendlyButton,
  width: '100%',
};

export const smallButton: SxProps<Theme> = {
  minHeight: 32,
  minWidth: 32,
  padding: '4px 8px',
  fontSize: '0.75rem',
};

/**
 * FOCUS STATES
 * Accessibility - visible focus for keyboard navigation
 */

export const focusStyle = (theme: Theme): SxProps<Theme> => ({
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
});

/**
 * INPUT UTILITIES
 * Form input patterns - focus, error states, etc.
 */

export const inputFocusStyle = (theme: Theme): SxProps<Theme> => ({
  '&:focus': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
  },
});

/**
 * OVERLAY UTILITIES
 * Common overlay patterns - image overlays, modals, etc.
 */

export const darkOverlay: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
};

export const gradientOverlay: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
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
    ...(tablet && theme && {
      [theme.breakpoints.up('md')]: tablet,
    }),
    ...(desktop && theme && {
      [theme.breakpoints.up('lg')]: desktop,
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

export const smoothTransition = (properties: string[] = ['all']): SxProps<Theme> => ({
  transition: `${properties.join(', ')} 200ms ease-in-out`,
});

export const hoverScale = (scale: number = 1.05): SxProps<Theme> => ({
  ...smoothTransition(['transform']),
  '&:hover': {
    transform: `scale(${scale})`,
  },
});

export const hoverShadow: SxProps<Theme> = {
  ...smoothTransition(['box-shadow']),
  '&:hover': {
    boxShadow: 4,
  },
};

/**
 * SCROLL UTILITIES
 * Scrolling behavior patterns
 */

export const hideScrollbar: SxProps<Theme> = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
};

export const customScrollbar: SxProps<Theme> = (theme: Theme) => ({
  scrollbarWidth: 'thin',
  scrollbarColor: `${theme.palette.action.hover} transparent`,
  '&::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.action.hover,
    borderRadius: '3px',
  },
});

/**
 * LAYOUT UTILITIES
 * Common layout patterns
 */

export const fullWidth: SxProps<Theme> = {
  width: '100%',
};

export const fullHeight: SxProps<Theme> = {
  height: '100%',
};

export const fullScreen: SxProps<Theme> = {
  width: '100%',
  height: '100%',
};

export const containerMax: SxProps<Theme> = {
  maxWidth: '100%',
  width: '100%',
  margin: '0 auto',
};

export const absoluteFill: SxProps<Theme> = {
  position: 'absolute',
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
  display: 'block',
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
});

export const desktopOnly: SxProps<Theme> = (theme: Theme) => ({
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'block',
  },
});

/**
 * GRID UTILITIES
 * Common grid patterns
 */

export const gridAutoFit = (minWidth: string = '200px'): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
  gap: 2,
});

export const gridAutoFill = (minWidth: string = '200px'): SxProps<Theme> => ({
  display: 'grid',
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
  cursor: 'pointer',
};

export const flexCenterContainer: SxProps<Theme> = {
  ...flexColumnCenter,
  ...fullScreen,
};

export const responsiveImage: SxProps<Theme> = {
  ...fullWidth,
  height: 'auto',
  display: 'block',
};

/**
 * DEPRECATED (replaced by theme tokens)
 * These are here to catch old patterns during migration
 */

/**
 * @deprecated Use theme.palette.primary.main instead
 */
export const primaryColor = (theme: Theme): string => theme.palette.primary.main;

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
  relationType: 'parent_child' | 'spouse' | 'partner' | 'sibling',
): string => {
  const relationshipPalette = (theme.palette as any).relationship;
  const colorMap = {
    parent_child: relationshipPalette.parent_child,
    spouse: relationshipPalette.spouse,
    partner: relationshipPalette.partner,
    sibling: relationshipPalette.sibling,
  };
  return colorMap[relationType] || relationshipPalette.parent_child;
};

// Export all as namespace for convenience
export const styles = {
  flexCenter,
  flexBetween,
  flexStart,
  flexColumn,
  flexColumnCenter,
  ellipsisText,
  truncateLines,
  mutedText,
  captionText,
  baseCard,
  elevatedCard,
  outlinedCard,
  aspectVideo,
  aspectSquare,
  coverImage,
  touchFriendlyButton,
  fullWidthButton,
  smallButton,
  focusStyle,
  inputFocusStyle,
  darkOverlay,
  gradientOverlay,
  smoothTransition,
  hoverScale,
  hoverShadow,
  hideScrollbar,
  customScrollbar,
  fullWidth,
  fullHeight,
  fullScreen,
  containerMax,
  absoluteFill,
  mobileOnly,
  desktopOnly,
  gridAutoFit,
  gridAutoFill,
  cardWithHover,
  flexCenterContainer,
  responsiveImage,
  createResponsiveStyle,
  spacingX,
  spacingY,
};

export default styles;

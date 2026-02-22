// EventSlimCard.styles.ts
// Extracted and reusable styles for EventSlimCard component

import { SxProps, Theme } from '@mui/material/styles';
import { cardVariants } from '../../../theme/variants.js';

/**
 * Card container - elevated style with hover effects
 */
export const cardSx: SxProps<Theme> = {
  ...cardVariants.elevated,
  width: '100%',
  height: '100%',
  cursor: 'pointer',
};

/**
 * Main layout - vertical or horizontal direction
 */
export const getStackSx = (isVertical: boolean) => ({
  direction: isVertical ? 'column' : 'row',
  alignItems: 'flex-start',
  width: '100%',
  gap: { xs: 1, sm: 2 },
} as const);

/**
 * Media wrapper - responsive sizing
 */
export const getMediaWrapperSx = (isVertical: boolean) => ({
  display: 'flex',
  width: isVertical ? '100%' : { xs: '120px', sm: '150px', md: '180px' },
  flexDirection: 'row',
  flexShrink: 0,
} as const);

/**
 * Media image - responsive sizing with proper aspect ratio
 */
export const getMediaImageSx = (isVertical: boolean, maxHeight?: number) => ({
  height: maxHeight ?? { xs: 150, sm: 150, md: 180 },
  width: isVertical ? '100%' : { xs: '120px', sm: '150px', md: '180px' },
  objectFit: 'cover',
  backgroundColor: 'action.hover',
} as const);

/**
 * Header container
 */
export const headerStackSx = {
  flexDirection: 'column',
  gap: 1,
} as const satisfies SxProps<Theme>;

/**
 * Excerpt container - limits height with overflow handling
 */
export const excerptContainerSx: SxProps<Theme> = {
  maxHeight: { xs: 100, sm: 120, md: 150 },
  overflow: 'hidden',
};

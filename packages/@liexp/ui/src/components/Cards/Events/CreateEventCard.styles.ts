// CreateEventCard.styles.ts
// Extracted and reusable styles for CreateEventCard component

import { SxProps, Theme } from '@mui/material/styles';
import { cardVariants } from '../../../theme/variants.js';

/**
 * Card container - elevated style
 */
export const cardSx: SxProps<Theme> = {
  ...cardVariants.elevated,
  width: '100%',
  minHeight: { xs: '200px', sm: '250px', md: '300px' },
  cursor: 'pointer',
};

/**
 * Wrapper box - clickable container
 */
export const wrapperBoxSx: SxProps<Theme> = {
  cursor: 'pointer',
  '&:hover': {
    filter: 'brightness(0.98)',
  },
};

/**
 * Header styling
 */
export const headerSx: SxProps<Theme> = {
  paddingBottom: { xs: 1, sm: 2 },
};

/**
 * Content area
 */
export const contentSx: SxProps<Theme> = {
  padding: { xs: 1.5, sm: 2 },
  minHeight: 80,
  maxHeight: 120,
  overflow: 'hidden',
};

/**
 * Actions area with keywords
 */
export const actionsSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: { xs: 0.5, sm: 1 },
  padding: { xs: 1, sm: 1.5 },
  borderTop: '1px solid',
  borderColor: 'divider',
};

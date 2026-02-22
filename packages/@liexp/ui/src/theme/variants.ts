// @liexp/ui/src/theme/variants.ts
// Component variant definitions to prevent style duplication

import { SxProps, Theme } from '@mui/material/styles';

/**
 * CARD VARIANTS
 * Reusable card styles with different visual emphasis levels
 */

export const cardVariants = {
  /**
   * Base card - minimal styling, used as foundation
   */
  base: {
    borderRadius: 1,
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
  } as SxProps<Theme>,

  /**
   * Elevated card - prominent styling with shadow
   */
  elevated: {
    borderRadius: 1.5,
    backgroundColor: 'background.paper',
    boxShadow: 2,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: 4,
      transform: 'translateY(-2px)',
    },
  } as SxProps<Theme>,

  /**
   * Outlined card - subtle border emphasis
   */
  outlined: {
    borderRadius: 1,
    backgroundColor: 'background.paper',
    border: '2px solid',
    borderColor: 'primary.main',
  } as SxProps<Theme>,

  /**
   * Filled card - solid background color
   */
  filled: {
    borderRadius: 1,
    backgroundColor: 'action.hover',
    border: 'none',
  } as SxProps<Theme>,
};

/**
 * TEXT VARIANTS
 * Consistent text styling patterns
 */

export const textVariants = {
  /**
   * Heading style - large, bold, primary color
   */
  heading: {
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
    fontWeight: 600,
    color: 'text.primary',
    lineHeight: 1.3,
    marginBottom: 1,
  } as SxProps<Theme>,

  /**
   * Subheading style - medium, semi-bold
   */
  subheading: {
    fontSize: { xs: '1rem', sm: '1.125rem' },
    fontWeight: 500,
    color: 'text.primary',
    lineHeight: 1.4,
    marginBottom: 0.5,
  } as SxProps<Theme>,

  /**
   * Body text - regular size and weight
   */
  body: {
    fontSize: { xs: '0.875rem', sm: '1rem' },
    fontWeight: 400,
    color: 'text.primary',
    lineHeight: 1.6,
  } as SxProps<Theme>,

  /**
   * Secondary text - muted color for less emphasis
   */
  secondary: {
    fontSize: { xs: '0.875rem', sm: '0.95rem' },
    fontWeight: 400,
    color: 'text.secondary',
    lineHeight: 1.5,
  } as SxProps<Theme>,

  /**
   * Caption text - small, secondary color
   */
  caption: {
    fontSize: { xs: '0.75rem', sm: '0.85rem' },
    fontWeight: 400,
    color: 'text.secondary',
    lineHeight: 1.4,
  } as SxProps<Theme>,

  /**
   * Label text - small, bold, for form labels
   */
  label: {
    fontSize: { xs: '0.75rem', sm: '0.85rem' },
    fontWeight: 600,
    color: 'text.primary',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as SxProps<Theme>,
};

/**
 * BUTTON VARIANTS
 * Consistent button styling patterns
 */

export const buttonVariants = {
  /**
   * Primary button - main call-to-action
   */
  primary: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    minHeight: { xs: '44px', sm: '40px' },
    minWidth: { xs: '44px', sm: '40px' },
    padding: { xs: '10px 16px', sm: '8px 16px' },
    borderRadius: 1,
    fontSize: { xs: '0.95rem', sm: '0.875rem' },
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'primary.dark',
      boxShadow: 1,
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  } as SxProps<Theme>,

  /**
   * Secondary button - alternative action
   */
  secondary: {
    backgroundColor: 'secondary.main',
    color: 'secondary.contrastText',
    minHeight: { xs: '44px', sm: '40px' },
    minWidth: { xs: '44px', sm: '40px' },
    padding: { xs: '10px 16px', sm: '8px 16px' },
    borderRadius: 1,
    fontSize: { xs: '0.95rem', sm: '0.875rem' },
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'secondary.dark',
      boxShadow: 1,
    },
  } as SxProps<Theme>,

  /**
   * Outlined button - tertiary action
   */
  outlined: {
    backgroundColor: 'transparent',
    color: 'primary.main',
    border: '1px solid',
    borderColor: 'primary.main',
    minHeight: { xs: '44px', sm: '40px' },
    minWidth: { xs: '44px', sm: '40px' },
    padding: { xs: '10px 16px', sm: '8px 16px' },
    borderRadius: 1,
    fontSize: { xs: '0.95rem', sm: '0.875rem' },
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'primary.light',
      borderColor: 'primary.dark',
    },
  } as SxProps<Theme>,

  /**
   * Ghost button - minimal, text-only
   */
  ghost: {
    backgroundColor: 'transparent',
    color: 'primary.main',
    minHeight: { xs: '44px', sm: '40px' },
    minWidth: { xs: '44px', sm: '40px' },
    padding: { xs: '10px 12px', sm: '8px 12px' },
    borderRadius: 0.5,
    fontSize: { xs: '0.95rem', sm: '0.875rem' },
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  } as SxProps<Theme>,

  /**
   * Icon button - minimal, square shape
   */
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: { xs: '44px', sm: '40px' },
    minWidth: { xs: '44px', sm: '40px' },
    padding: { xs: '8px', sm: '4px' },
    borderRadius: 0.5,
    backgroundColor: 'transparent',
    color: 'text.primary',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
  } as SxProps<Theme>,
};

/**
 * FORM INPUT VARIANTS
 * Consistent form input styling
 */

export const inputVariants = {
  /**
   * Standard input field
   */
  standard: {
    minHeight: { xs: '44px', sm: '40px' },
    padding: { xs: '12px', sm: '8px 12px' },
    fontSize: { xs: '16px', sm: '14px' },
    borderRadius: 0.5,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: 'primary.main',
    },
    '&:focus': {
      outline: 'none',
      borderColor: 'primary.main',
      boxShadow: `0 0 0 3px rgba(255, 94, 91, 0.1)`,
    },
  } as SxProps<Theme>,

  /**
   * Filled input field
   */
  filled: {
    minHeight: { xs: '44px', sm: '40px' },
    padding: { xs: '12px', sm: '8px 12px' },
    fontSize: { xs: '16px', sm: '14px' },
    borderRadius: 0.5,
    border: 'none',
    backgroundColor: 'action.hover',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'action.selected',
    },
    '&:focus': {
      outline: 'none',
      backgroundColor: 'background.paper',
      borderBottom: '2px solid',
      borderBottomColor: 'primary.main',
    },
  } as SxProps<Theme>,
};

/**
 * LAYOUT VARIANTS
 * Common layout patterns
 */

export const layoutVariants = {
  /**
   * Responsive grid layout - 1 col on mobile, 2 on tablet, 3+ on desktop
   */
  responsiveGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
    gap: { xs: 1, sm: 2, md: 2.5 },
  } as SxProps<Theme>,

  /**
   * Card container - consistent spacing and sizing
   */
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 1.5,
    overflow: 'hidden',
    backgroundColor: 'background.paper',
    transition: 'all 0.2s ease-in-out',
  } as SxProps<Theme>,

  /**
   * Section layout - full width with max width constraint
   */
  section: {
    width: '100%',
    maxWidth: 1440,
    margin: '0 auto',
    padding: { xs: 2, sm: 3, md: 4 },
  } as SxProps<Theme>,

  /**
   * Flex spacer - pushes content to edges
   */
  flexSpacer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  } as SxProps<Theme>,
};

/**
 * BADGE VARIANTS
 * Status and label badges
 */

export const badgeVariants = {
  /**
   * Primary badge - main status indicator
   */
  primary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: { xs: '4px 8px', sm: '4px 12px' },
    borderRadius: '12px',
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    fontSize: { xs: '0.65rem', sm: '0.75rem' },
    fontWeight: 600,
    whiteSpace: 'nowrap',
  } as SxProps<Theme>,

  /**
   * Secondary badge - alternative status
   */
  secondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: { xs: '4px 8px', sm: '4px 12px' },
    borderRadius: '12px',
    backgroundColor: 'secondary.main',
    color: 'secondary.contrastText',
    fontSize: { xs: '0.65rem', sm: '0.75rem' },
    fontWeight: 600,
    whiteSpace: 'nowrap',
  } as SxProps<Theme>,

  /**
   * Outlined badge - subtle status
   */
  outlined: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: { xs: '4px 8px', sm: '4px 12px' },
    borderRadius: '12px',
    backgroundColor: 'transparent',
    color: 'primary.main',
    border: '1px solid',
    borderColor: 'primary.main',
    fontSize: { xs: '0.65rem', sm: '0.75rem' },
    fontWeight: 600,
    whiteSpace: 'nowrap',
  } as SxProps<Theme>,
};

/**
 * AVATAR VARIANTS
 * Different avatar sizes and styles
 */

export const avatarVariants = {
  /**
   * Extra small avatar - 32px
   */
  xs: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    fontSize: '0.75rem',
    fontWeight: 600,
  } as SxProps<Theme>,

  /**
   * Small avatar - 40px
   */
  sm: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    fontSize: '0.875rem',
    fontWeight: 600,
  } as SxProps<Theme>,

  /**
   * Medium avatar - 48px
   */
  md: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    fontSize: '1rem',
    fontWeight: 600,
  } as SxProps<Theme>,

  /**
   * Large avatar - 56px
   */
  lg: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    fontSize: '1.125rem',
    fontWeight: 600,
  } as SxProps<Theme>,

  /**
   * Extra large avatar - 64px
   */
  xl: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    fontSize: '1.25rem',
    fontWeight: 600,
  } as SxProps<Theme>,
};

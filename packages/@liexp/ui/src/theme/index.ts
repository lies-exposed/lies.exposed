/* eslint-disable no-restricted-imports */
import * as muiColors from "@mui/material/colors";
import {
  createTheme,
  styled,
  ThemeProvider,
  type Theme,
  type ThemeOptions,
  type SxProps,
  useTheme,
} from "@mui/material/styles";
import { darken, lighten, alpha } from "@mui/system";

const {
  yellow,
  lightBlue: _lightBlue,
  lightGreen: _lightGreen,
  red,
} = muiColors;

const primaryFontFamily = "Signika";
const secondaryFontFamily = "Lora";

const primary = "#FF5E5B";
const primaryLight = lighten(primary, 0.5);
const primaryDark = darken(primary, 0.5);

const secondary = "#17B9B6";
const secondaryLight = lighten(secondary, 0.5);
const secondaryDark = darken(primary, 0.5);

const lightGreen = _lightGreen[300];
const lightRed = red[200];
const lightYellow = yellow[200];
const lightBlue = _lightBlue.A100;

const deletedBackgroundColor = alpha("#FF0000", 0.3);

// Event type colors - used for visual distinction of event categories
const eventTypeBook = "#B5F425";
const eventTypeUncategorized = "#EC3535";
const eventTypeDeath = "#111111";
const eventTypeScientificStudy = "#2596be";
const eventTypePatent = "#BE259E";
const eventTypeDocumentary = "#2538BE";
const eventTypeTransaction = "#2DBE25";
const eventTypeQuote = "#451ade";

// Dark mode friendly versions
const eventTypeDeathDark = "#E8E8E8";

// Relationship colors for graph visualizations
const relationshipParentChild = "#555";
const relationshipSpouse = "#e91e63";
const relationshipPartner = "#9c27b0";
const relationshipSibling = "#4caf50";

const colors = {
  primary,
  primaryLight,
  primaryDark,
  secondary,
  secondaryLight,
  secondaryDark,
  lightGreen,
  lightRed,
  lightYellow,
  lightBlue,
  // custom colors
  deletedBackgroundColor,
};

// Dark theme colors for dark mode
const darkPrimary = "#FF7976";
const darkPrimaryLight = lighten(darkPrimary, 0.3);
const darkPrimaryDark = darken(darkPrimary, 0.3);

const darkSecondary = "#4DD3CF";
const darkSecondaryLight = lighten(darkSecondary, 0.3);
const darkSecondaryDark = darken(darkSecondary, 0.3);

const createLightPalette = () => ({
  common: {
    white: "#EEE",
    black: "#111",
  },
  primary: {
    main: primary,
    light: primaryLight,
    dark: primaryDark,
    contrastText: "#fff",
  },
  secondary: {
    main: secondary,
    light: secondaryLight,
    dark: secondaryDark,
    contrastText: "#FFF",
  },
  background: {
    default: "#fafafa",
    paper: "#fff",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "rgba(0, 0, 0, 0.6)",
  },
  eventType: {
    book: eventTypeBook,
    uncategorized: eventTypeUncategorized,
    death: eventTypeDeath,
    scientific_study: eventTypeScientificStudy,
    patent: eventTypePatent,
    documentary: eventTypeDocumentary,
    transaction: eventTypeTransaction,
    quote: eventTypeQuote,
  },
  relationship: {
    parent_child: relationshipParentChild,
    spouse: relationshipSpouse,
    partner: relationshipPartner,
    sibling: relationshipSibling,
  },
});

const createDarkPalette = () => ({
  common: {
    white: "#fff",
    black: "#E8E8E8", // Light gray for visibility on dark backgrounds
  },
  primary: {
    main: darkPrimary,
    light: darkPrimaryLight,
    dark: darkPrimaryDark,
    contrastText: "#000", // Dark text on light primary backgrounds
  },
  secondary: {
    main: darkSecondary,
    light: darkSecondaryLight,
    dark: darkSecondaryDark,
    contrastText: "#000", // Dark text on light secondary backgrounds
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#fff",
    secondary: "rgba(255, 255, 255, 0.7)",
  },
  eventType: {
    book: eventTypeBook,
    uncategorized: eventTypeUncategorized,
    death: eventTypeDeathDark, // Use dark-friendly version
    scientific_study: eventTypeScientificStudy,
    patent: eventTypePatent,
    documentary: eventTypeDocumentary,
    transaction: eventTypeTransaction,
    quote: eventTypeQuote,
  },
  relationship: {
    parent_child: relationshipParentChild,
    spouse: relationshipSpouse,
    partner: relationshipPartner,
    sibling: relationshipSibling,
  },
});

const lightPalette = createLightPalette();
const darkPalette = createDarkPalette();

const themeOptions: ThemeOptions = {
  palette: lightPalette,
  typography: () => ({
    fontWeightRegular: 400,
    fontWeightBold: 600,
    h1: {
      fontFamily: secondaryFontFamily,
      marginBottom: 40,
      fontWeight: 600,
    },
    h2: {
      fontFamily: secondaryFontFamily,
      marginBottom: 30,
      fontWeight: 600,
    },
    h3: {
      fontFamily: secondaryFontFamily,
      marginBottom: 20,
      fontWeight: 600,
    },
    h4: {
      fontFamily: secondaryFontFamily,
      marginBottom: 20,
      fontWeight: 600,
    },
    h5: {
      fontFamily: secondaryFontFamily,
      marginBottom: 20,
      fontWeight: 600,
    },
    h6: {
      fontFamily: secondaryFontFamily,
      marginBottom: 20,
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontFamily: secondaryFontFamily,
      fontWeight: 400,
    },
    body2: {
      fontFamily: primaryFontFamily,
      fontWeight: 300,
      fontSize: "1rem",
    },
  }),
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        WebkitFontSmoothing: "auto",
        // html: "100%",
        fontFamily: primaryFontFamily,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: primary,
        },
      },
      defaultProps: {
        color: "primary",
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Ensure minimum touch target size of 44px per WCAG mobile guidelines
          "@media (max-width: 600px)": {
            minWidth: "44px",
            minHeight: "44px",
            padding: "10px",
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          flexDirection: "row",
          alignItems: "center",
          gap: "8px",
          "@media (max-width: 599px)": {
            minHeight: 56,
            height: 56,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          // Ensure form inputs have proper touch target size on mobile
          "@media (max-width: 600px)": {
            "& .MuiInputBase-root": {
              minHeight: "44px",
              fontSize: "16px", // Prevents mobile zoom on focus
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          // Proper sizing for input fields on mobile
          "@media (max-width: 600px)": {
            minHeight: "44px",
            fontSize: "16px", // Prevents iOS auto-zoom on input focus
            padding: "8px 12px",
          },
        },
        input: {
          "@media (max-width: 600px)": {
            padding: "12px",
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            fontSize: "0.95rem",
            marginBottom: "4px",
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            marginBottom: "16px",
            width: "100%",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            minHeight: "44px",
            minWidth: "44px",
            fontSize: "1rem",
            padding: "10px 16px",
          },
        },
      },
    },
    MuiTabs: {
      defaultProps: {
        variant: "scrollable",
        scrollButtons: "auto",
      },
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            minHeight: "48px",
          },
        },
        scrollButtons: {
          "@media (max-width: 600px)": {
            minWidth: "44px",
            width: "44px",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            minHeight: "48px",
            fontSize: "0.875rem",
            padding: "8px 12px",
            minWidth: "auto",
            // Prevent tab text from wrapping
            whiteSpace: "nowrap",
          },
        },
      },
    },
  },
};

(themeOptions.components as any).MuiTimelineDot = {
  styleOverrides: {
    root: {
      borderColor: "#fff",
    },
  },
};

const createECOTheme = (palette: ReturnType<typeof createLightPalette>) => {
  return createTheme({
    ...themeOptions,
    palette,
  });
};

const ECOTheme = createECOTheme(lightPalette);
const ECOThemeDark = createECOTheme(darkPalette);

type ECOTheme = typeof ECOTheme;

export {
  ECOTheme,
  ECOThemeDark,
  colors,
  useTheme,
  styled,
  themeOptions,
  type ThemeOptions,
  type Theme,
  type SxProps,
  ThemeProvider,
  createLightPalette,
  createDarkPalette,
  lightPalette,
  darkPalette,
  createECOTheme,
  createTheme,
  darken,
  lighten,
  alpha,
};

// Note: styleUtils is intentionally NOT re-exported here to avoid circular dependencies
// Components should import utility functions directly from styleUtils.js if needed

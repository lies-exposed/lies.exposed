import {
  themeOptions,
  createTheme,
  darken,
  lighten,
  type ThemeOptions,
} from "@liexp/ui/lib/theme/index.js";

// Admin theme uses inverted colors from web UI theme
// Web primary (#FF5E5B) becomes admin secondary
// Web secondary (#17B9B6) becomes admin primary
const primary = "#17B9B6";
const primaryLight = lighten(primary, 0.5);
const primaryDark = darken(primary, 0.5);

const secondary = "#FF5E5B";
const secondaryLight = lighten(secondary, 0.5);
const secondaryDark = darken(secondary, 0.5);

// Dark theme variants
const darkPrimary = "#4DD3CF";
const darkPrimaryLight = lighten(darkPrimary, 0.3);
const darkPrimaryDark = darken(darkPrimary, 0.3);

const darkSecondary = "#FF7976";
const darkSecondaryLight = lighten(darkSecondary, 0.3);
const darkSecondaryDark = darken(darkSecondary, 0.3);

const lightPalette = {
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
};

const darkPalette = {
  primary: {
    main: darkPrimary,
    light: darkPrimaryLight,
    dark: darkPrimaryDark,
    contrastText: "#000",
  },
  secondary: {
    main: darkSecondary,
    light: darkSecondaryLight,
    dark: darkSecondaryDark,
    contrastText: "#000",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#fff",
    secondary: "rgba(255, 255, 255, 0.7)",
  },
};

const createBaseAdminTheme = (
  palette: typeof lightPalette | typeof darkPalette,
  isDark = false,
): ThemeOptions => ({
  ...themeOptions,
  palette,
  components: {
    ...themeOptions.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.primary.main,
        },
      },
    },
    // Icon colors in sidebar for dark mode
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: isDark ? palette.primary.main : undefined,
          minWidth: 40,
        },
      },
    },
    // Mobile-responsive button sizing
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: "44px", // Touch target size
          minWidth: "44px",
          "@media (max-width: 600px)": {
            padding: "10px 16px",
            fontSize: "0.875rem",
          },
        },
        sizeSmall: {
          "@media (max-width: 600px)": {
            minHeight: "40px",
            minWidth: "40px",
            padding: "8px 12px",
          },
        },
      },
    },
    // Mobile-responsive icon button sizing
    MuiIconButton: {
      styleOverrides: {
        root: {
          minHeight: "44px", // Touch target size
          minWidth: "44px",
          "@media (max-width: 600px)": {
            padding: "12px",
          },
        },
        sizeMedium: {
          "@media (max-width: 600px)": {
            padding: "10px",
          },
        },
        sizeSmall: {
          "@media (max-width: 600px)": {
            padding: "8px",
          },
        },
      },
    },
    // Mobile-responsive list items
    MuiListItem: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            minHeight: "48px",
            padding: "12px 16px",
          },
        },
      },
    },
    // Mobile-responsive menu items
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: "44px", // Touch target size
          "@media (max-width: 600px)": {
            minHeight: "48px",
            padding: "12px 16px",
            fontSize: "0.875rem",
          },
        },
      },
    },
    // Mobile-responsive table styling
    MuiTableCell: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            padding: "8px 12px",
            fontSize: "0.75rem",
          },
        },
        head: {
          "@media (max-width: 600px)": {
            fontWeight: 700,
            padding: "8px 12px",
            fontSize: "0.75rem",
          },
        },
      },
    },
    // Mobile-responsive input sizing
    MuiTextField: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            width: "100%",
          },
        },
      },
    },
    // Mobile-responsive drawer for navigation
    MuiDrawer: {
      styleOverrides: {
        paper: {
          "@media (max-width: 600px)": {
            width: "100%",
            maxWidth: "280px",
          },
        },
      },
    },
    // Mobile-responsive pagination
    MuiTablePagination: {
      styleOverrides: {
        root: {
          "@media (max-width: 600px)": {
            fontSize: "0.75rem",
            padding: "16px 8px",
          },
        },
        toolbar: {
          "@media (max-width: 600px)": {
            padding: "12px 8px",
            flexWrap: "wrap",
            gap: "12px",
            minHeight: "auto",
            justifyContent: "space-between",
          },
        },
        selectLabel: {
          "@media (max-width: 600px)": {
            margin: "0",
            fontSize: "0.75rem",
          },
        },
        displayedRows: {
          "@media (max-width: 600px)": {
            margin: "0",
            fontSize: "0.75rem",
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

const createAdminThemeOptions = (
  mode: "light" | "dark" = "light",
): ReturnType<typeof createTheme> => {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  const isDark = mode === "dark";
  const baseOptions = createBaseAdminTheme(palette, isDark);
  return createTheme(baseOptions);
};

export { createAdminThemeOptions };

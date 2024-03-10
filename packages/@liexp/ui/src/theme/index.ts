/* eslint-disable no-restricted-imports */
import {
  createTheme,
  useTheme,
  type ThemeOptions,
  ThemeProvider,
} from "@mui/material";
import { createStyled, darken, lighten } from "@mui/system";

const primaryFontFamily = "Signika";
const secondaryFontFamily = "Lora";

const primary = "#FF5E5B";
const primaryLight = lighten(primary, 0.5);
const primaryDark = darken(primary, 0.5);

export const secondary = "#17B9B6";
export const secondaryLight = lighten(secondary, 0.5);
export const secondaryDark = darken(primary, 0.5);

const themeOptions: ThemeOptions = {
  palette: {
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
  },
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
    },
    body1: {
      fontFamily: secondaryFontFamily,
      fontWeight: 400,
    },
    body2: {
      fontFamily: primaryFontFamily,
      fontWeight: 300,
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
  },
};

(themeOptions.components as any).MuiTimelineDot = {
  styleOverrides: {
    root: {
      borderColor: "#fff",
    },
  },
};

const ECOTheme = createTheme(themeOptions as any);

type ECOTheme = typeof ECOTheme;

const styled = createStyled({ defaultTheme: ECOTheme });

export {
  ECOTheme,
  useTheme,
  styled,
  themeOptions,
  type ThemeOptions,
  ThemeProvider,
};

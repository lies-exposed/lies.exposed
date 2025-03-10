/* eslint-disable no-restricted-imports */
import * as muiColors from "@mui/material/colors";
import {
  createTheme,
  styled,
  ThemeProvider,
  type ThemeOptions,
  useTheme,
} from "@mui/material/styles";
import { darken, lighten } from "@mui/system";

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
};

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
  },
};

(themeOptions.components as any).MuiTimelineDot = {
  styleOverrides: {
    root: {
      borderColor: "#fff",
    },
  },
};

const ECOTheme = createTheme(themeOptions);

type ECOTheme = typeof ECOTheme;

export {
  ECOTheme,
  colors,
  useTheme,
  styled,
  themeOptions,
  type ThemeOptions,
  ThemeProvider,
};

import {
  darken,
  lighten, makeStyles,
  useTheme,
} from "@material-ui/core";
import { createTheme } from '@material-ui/core/styles';

const primaryFontFamily = "Signika";
const secondaryFontFamily = "Lora";

const primary = "#FF5E5B";
const primaryLight = lighten(primary, .5);
const primaryDark = darken(primary, .5);

const secondary = "#17B9B6";
const secondaryLight = lighten(secondary, .5);
const secondaryDark = darken(primary, .5);

const ECOTheme = createTheme({
  palette: {
    // type: "dark",
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
  typography: (palette) => ({
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
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto",
          // html: "100%",
          fontFamily: primaryFontFamily,
        },
      },
    },
    MuiAppBar: {
      colorPrimary: primary as any,
      colorDefault: "#FFF" as any,
    },
  },
});

(ECOTheme.overrides as any).MuiTimelineDot = {
  root: {
    borderColor: "#fff",
  },
};

type ECOTheme = typeof ECOTheme;

export { ECOTheme, makeStyles, useTheme };

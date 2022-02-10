import "./font.css";
import {
  createTheme,
  makeStyles,
  useTheme,
  darken,
  lighten,
} from "@material-ui/core";

const primaryFontFamily = "Signika";
const secondaryFontFamily = "Lora";

const primary = "#FF5E5B"
const primaryLight = lighten(primary, 20);
const primaryDark = darken(primary, 20);

const secondary = "#17B9B6";
const secondaryLight = lighten(secondary, 20);
const secondaryDark = darken(primary, 20);

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
      fontFamily: primaryFontFamily,
      marginBottom: 40,
    },
    h2: {
      fontFamily: primaryFontFamily,
      marginBottom: 30,
    },
    h3: {
      fontFamily: primaryFontFamily,
      marginBottom: 20,
    },
    h4: {
      fontFamily: primaryFontFamily,
      marginBottom: 20,
    },
    h5: {
      fontFamily: primaryFontFamily,
      marginBottom: 20,
    },
    h6: {
      fontFamily: primaryFontFamily,
      marginBottom: 20,
    },
    body1: {
      fontSize: 18,
      fontFamily: secondaryFontFamily,
    },
  }),
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto",
          // html: "100%",
          fontFamily: secondaryFontFamily,
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

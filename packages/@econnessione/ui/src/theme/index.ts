import "./font.css";
import { createTheme } from "@material-ui/core";

const primaryFontFamily = "Signika";
const secondaryFontFamily = "Lora";

const primary = "#9100ff";
const primaryLight = "#c950ff";
const primaryDark = "#5600ca";

const secondary = "#1bff54";
const secondaryLight = "#73ff87";
const secondaryDark = "#00ca1a";

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
      contrastText: "#000000",
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
      colorPrimary: "#c30ff7" as any,
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

export { ECOTheme };

import "./font.css";
import { createTheme } from "@material-ui/core";

const primaryFontFamily = "Signika";
const secondaryFontFamily = "Lora";

const ECOTheme = createTheme({
  palette: {
    // type: "dark",
    primary: {
      main: "#2196f3",
      light: "#6ec6ff",
      dark: "#0069c0",
      contrastText: "#000000",
    },
    secondary: {
      main: "#f57f17",
      light: "#ffb04c",
      dark: "#bc5100",
      contrastText: "#000000",
    },
  },
  typography: (palette) => ({
    fontWeightBold: 400,
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

type ECOTheme = typeof ECOTheme;

export { ECOTheme };

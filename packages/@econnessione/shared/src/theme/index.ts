import "./font.css";
import { createTheme } from "@material-ui/core";

const headerFontFamily = "Lora";

export const theme = createTheme({
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
    h1: {
      fontFamily: headerFontFamily,
      marginBottom: 40,
    },
    h2: {
      fontFamily: headerFontFamily,
      marginBottom: 30,
    },
    h3: {
      fontFamily: headerFontFamily,
      marginBottom: 20,
    },
    h4: {
      fontFamily: headerFontFamily,
      marginBottom: 20,
    },
    h5: {
      fontFamily: headerFontFamily,
      marginBottom: 20,
    },
    h6: {
      fontFamily: headerFontFamily,
      marginBottom: 20,
    },
    body1: {
      fontSize: 18,
    },
  }),
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto",
          html: "100%",
          fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
        },
      },
    },
    MuiAppBar: {
      colorPrimary: "#c30ff7" as any,
      colorDefault: "#FFF" as any,
    },
  },
});
import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
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
      fontSize: 44,
      fontWeight: 600,
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

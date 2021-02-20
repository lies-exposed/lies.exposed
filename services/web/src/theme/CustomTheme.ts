import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
  palette: {
    // type: "dark",
  },
  typography: {},
  overrides: {
    MuiAppBar: {
      colorPrimary: "#FFF" as any,
      colorDefault: "#FFF" as any
    },
  },
});

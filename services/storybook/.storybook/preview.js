import { ThemeProvider } from "@material-ui/core";
import * as React from "react";
import { theme } from "@econnessione/ui/theme";
import "ol/ol.css";
import "source-serif-pro/source-serif-pro.css";

// import { Client as Styletron } from "styletron-engine-atomic";
// import { Provider as StyletronProvider } from "styletron-react";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const withThemeProvider = (Story, context) => {
  return (
    <ThemeProvider theme={theme}>
      <Story {...context} />
    </ThemeProvider>
  );
};
export const decorators = [withThemeProvider];

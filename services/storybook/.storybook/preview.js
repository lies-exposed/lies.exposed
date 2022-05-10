import "ol/ol.css";
import { ThemeProvider } from "@mui/material";
import * as React from "react";
import { ECOTheme } from "@liexp/ui/theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const withThemeProvider = (Story, context) => {
  return (
    <ThemeProvider theme={ECOTheme}>
      <Story {...context} />
    </ThemeProvider>
  );
};
export const decorators = [withThemeProvider];

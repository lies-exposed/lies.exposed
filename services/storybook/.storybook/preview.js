import { ThemeProvider, createMuiTheme } from "@material-ui/core";
import * as React from "react";
// import { Client as Styletron } from "styletron-engine-atomic";
// import { Provider as StyletronProvider } from "styletron-react";

const theme = createMuiTheme({});
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const withThemeProvider = (Story, context) => {
  return (
    <ThemeProvider
      theme={theme}
      style={{
        minHeight: "100%",
        display: "flex",
      }}
    >
      <Story {...context} />
    </ThemeProvider>
  );
};
export const decorators = [withThemeProvider];

import '@liexp/ui/theme/main.css';
import { ThemeProvider } from "@mui/material";
import * as React from "react";
import { ECOTheme } from "@liexp/ui/theme";
import { QueryClientProvider, QueryClient } from "react-query";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import { config, dom } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

// watch for font awesome icons
dom.watch();

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const withThemeProvider = (Story, context) => {
  const qc = new QueryClient();
  return (
    <HelmetProvider>
      <QueryClientProvider client={qc}>
        <ThemeProvider theme={ECOTheme}>
          <Story {...context} />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};
export const decorators = [withThemeProvider];

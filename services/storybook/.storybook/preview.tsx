import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import { ECOTheme } from "@liexp/ui/theme";
import "@liexp/ui/theme/main.css";
import { ThemeProvider } from "@mui/material";
import { Preview } from "@storybook/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

config.autoAddCss = false;

// watch for font awesome icons
dom.watch();

const qc = new QueryClient();

const cache = createCache({ key: "css", prepend: true });
const withThemeProvider = (Story, context) => {
  return (
    <HelmetProvider>
      <CacheProvider value={cache}>
        <QueryClientProvider client={qc} contextSharing={true}>
          <ThemeProvider theme={ECOTheme}>
            <Story {...context} />
          </ThemeProvider>
        </QueryClientProvider>
      </CacheProvider>
    </HelmetProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
  decorators: [withThemeProvider],
};

export default preview;

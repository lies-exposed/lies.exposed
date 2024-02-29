import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO";
import { ECOTheme, ThemeProvider } from "@liexp/ui/lib/theme/index.js";
import { Decorator, Parameters } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { DataProviderContext } from "react-admin";
import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
// styles
import "@liexp/react-page/assets/react-page.css";
import "@liexp/ui/lib/components/Common/Icons/library.js";
import "@liexp/ui/assets/main.css";

config.autoAddCss = false;

// watch for font awesome icons
dom.watch();

const apiProvider = APIRESTClient({
  url: import.meta.env.VITE_API_URL ?? "https://alpha.api.lies.exposed/v1",
});
const qc = new QueryClient();

const cache = createCache({ key: "css", prepend: true });

const withThemeProvider = (Story, context) => {
  return (
    <DataProviderContext.Provider value={apiProvider}>
      <HelmetProvider>
        <CacheProvider value={cache}>
          <QueryClientProvider client={qc}>
            <ThemeProvider theme={ECOTheme}>
              <Story {...context} />
            </ThemeProvider>
          </QueryClientProvider>
        </CacheProvider>
      </HelmetProvider>
    </DataProviderContext.Provider>
  );
};

export const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators: Decorator[] = [withThemeProvider];

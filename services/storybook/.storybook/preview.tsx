import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO.js";
import {
  ConfigurationContext,
  defaultConfiguration,
} from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DataProviderContext } from "@liexp/ui/lib/context/DataProviderContext.js";
import { ECOTheme, ThemeProvider } from "@liexp/ui/lib/theme/index.js";
import {
  type Decorator,
  type Parameters,
  type Preview,
} from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import * as React from "react";

// styles
import "@liexp/ui/lib/components/Common/Icons/library.js";
import "@liexp/ui/assets/main.css";
import "@liexp/ui/assets/blocknote.css";

config.autoAddCss = false;

// watch for font awesome icons
dom.watch();

const apiUrl = import.meta.env.VITE_API_URL ?? "http://api.liexp.dev/v1";

const apiProvider = APIRESTClient({
  url: apiUrl,
  getAuth: getAuthFromLocalStorage,
});

const qc = new QueryClient();

const cache = createCache({ key: "css", prepend: true });

const withThemeProvider = (Story: any, context: any) => {
  return (
    <ConfigurationContext.Provider
      value={{
        ...defaultConfiguration,
        platforms: {
          ...defaultConfiguration.platforms,
          api: {
            ...defaultConfiguration.platforms.api,
            url: apiUrl,
          },
        },
      }}
    >
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
    </ConfigurationContext.Provider>
  );
};

const parameters: Parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controlPanel: true,
};

const decorators: Decorator[] = [withThemeProvider];

const preview: Preview = {
  initialGlobals: {
    theme: "dark",
  },
  tags: ["autodocs"],
  parameters,
  decorators,
};

export default preview;

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO.js";
import { ECOTheme, ThemeProvider } from "@liexp/ui/lib/theme/index.js";
import { Decorator, Parameters } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { DataProviderContext } from "@liexp/ui/lib/components/admin/react-admin.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import axios from "axios";
import { Endpoints } from "@liexp/shared/lib/endpoints/Endpoints.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";

// styles
import "@liexp/ui/lib/components/Common/Icons/library.js";
import "@liexp/ui/assets/main.css";
import "@liexp/ui/assets/blocknote.css";

config.autoAddCss = false;

// watch for font awesome icons
dom.watch();

const apiProvider = GetResourceClient(
  axios.create({
    url: import.meta.env.VITE_API_URL ?? "https://alpha.api.lies.exposed/v1",
  }),
  Endpoints,
  {
    decode: EffectDecoder((e) => DecodeError.of(e)),
  },
);
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

import { CacheProvider } from "@emotion/react";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO.js";
import {
  CssBaseline,
  ThemeProvider,
} from "@liexp/ui/lib/components/mui/index.js";
import { ConfigurationContext } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DataProviderContext } from "@liexp/ui/lib/context/DataProviderContext.js";
import { type ServerRenderer } from "@liexp/ui/lib/react/vite/render.js";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";
import { App } from "../client/App.js";
import { configuration } from "../client/configuration/index.js";

// load FA icons
import "@liexp/ui/lib/components/Common/Icons/library.js";

const render: ServerRenderer = (
  {
    url,
    cache,
    apiProvider,
    dehydratedState,
    helmetContext,
    queryClient,
    theme,
  },
  options,
) => {
  return ReactDOMServer.renderToPipeableStream(
    <StaticRouter location={url}>
      <ConfigurationContext.Provider value={configuration}>
        <DataProviderContext.Provider value={apiProvider}>
          <HelmetProvider context={helmetContext}>
            <QueryClientProvider client={queryClient}>
              <HydrationBoundary state={dehydratedState}>
                <CacheProvider value={cache}>
                  <ThemeProvider theme={theme}>
                    <CssBaseline enableColorScheme />
                    <React.Suspense>
                      <App pathname={url} />
                    </React.Suspense>
                  </ThemeProvider>
                </CacheProvider>
              </HydrationBoundary>
            </QueryClientProvider>
          </HelmetProvider>
        </DataProviderContext.Provider>
      </ConfigurationContext.Provider>
    </StaticRouter>,
    options,
  );
};

export { render, configuration };

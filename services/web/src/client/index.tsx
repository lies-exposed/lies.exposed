import { CacheProvider } from "@emotion/react";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { getAuthFromLocalStorage } from "@liexp/ui/lib/client/api.js";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO.js";
import {
  CssBaseline,
  ThemeProvider,
} from "@liexp/ui/lib/components/mui/index.js";
import { ConfigurationContext } from "@liexp/ui/lib/context/ConfigurationContext.js";
import { DataProviderContext } from "@liexp/ui/lib/context/DataProviderContext.js";
import createEmotionCache from "@liexp/ui/lib/react/createEmotionCache.js";
import { ECOTheme } from "@liexp/ui/lib/theme/index.js";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { APIRESTClient } from "@ts-endpoint/react-admin";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App.js";
import { configuration } from "./configuration/index.js";

config.autoAddCss = false;

debug.enable(import.meta.env.VITE_DEBUG ?? "@liexp:*:error");

// watch for font awesome icons
dom.watch();

// create emotion cache
const cache = createEmotionCache();

function Main(): React.ReactElement {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  const [conf] = React.useState(configuration);

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            notifyOnChangeProps: ["isLoading", "isError", "data", "error"],
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [apiProvider] = React.useState(() => {
    return APIRESTClient({
      url: conf.platforms.api.url,
      getAuth: getAuthFromLocalStorage,
    });
  });

  const dehydratedState = (window as any).__REACT_QUERY_STATE__;

  return (
    <BrowserRouter>
      <ConfigurationContext.Provider value={configuration}>
        <DataProviderContext.Provider value={apiProvider}>
          <HelmetProvider>
            <CacheProvider value={cache}>
              <ThemeProvider theme={ECOTheme}>
                <QueryClientProvider client={queryClient}>
                  <HydrationBoundary state={dehydratedState}>
                    <CssBaseline enableColorScheme />
                    <App />
                  </HydrationBoundary>
                </QueryClientProvider>
              </ThemeProvider>
            </CacheProvider>
          </HelmetProvider>
        </DataProviderContext.Provider>
      </ConfigurationContext.Provider>
    </BrowserRouter>
  );
}

const container: any = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);

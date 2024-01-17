import { CacheProvider } from "@emotion/react";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { HelmetProvider } from "@liexp/ui/lib/components/SEO.js";
import {
  CssBaseline,
  ThemeProvider,
} from "@liexp/ui/lib/components/mui/index.js";
import createEmotionCache from "@liexp/ui/lib/react/createEmotionCache.js";
import { ECOTheme } from "@liexp/ui/lib/theme/index.js";
import {
  HydrationBoundary,
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { App } from "./App";

config.autoAddCss = false;

debug.enable(process.env.DEBUG ?? "@liexp:*:error");

// watch for font awesome icons
dom.watch();

// create emotion cache
const cache = createEmotionCache();

function Main(): JSX.Element {
  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        notifyOnChangeProps: ["isLoading", "isError", "data", "error"],
      },
    },
  }));

  const dehydratedState = (window as any).__REACT_QUERY_STATE__;

  const Router =
    process.env.NODE_ENV === "development" ? HashRouter : BrowserRouter;
  return (
    <Router>
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
    </Router>
  );
}

const container: any = document.getElementById("root");
const root = ReactDOM.createRoot(container);

/**
 * here we use a React.Fragment cause
 * React.StrictMode messes with @react-page/editor drawer
 */
root.render(
  <React.Fragment>
    <Main />
  </React.Fragment>,
);

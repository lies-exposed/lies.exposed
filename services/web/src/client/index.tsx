import { CacheProvider } from "@emotion/react";
import { config, dom } from "@fortawesome/fontawesome-svg-core";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import { CssBaseline, ThemeProvider } from "@liexp/ui/components/mui";
import createEmotionCache from "@liexp/ui/react/createEmotionCache";
import { ECOTheme } from "@liexp/ui/theme";
import debug from "debug";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Hydrate, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { queryClient } from "./state/queries";
import "@liexp/ui/theme/main.css";

config.autoAddCss = false;

debug.enable("*");

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

  const dehydratedState = (window as any).__REACT_QUERY_STATE__;

  return (
    <BrowserRouter>
      <HelmetProvider>
        <CacheProvider value={cache}>
          <ThemeProvider theme={ECOTheme}>
            <QueryClientProvider client={queryClient}>
              <Hydrate state={dehydratedState}>
                <CssBaseline enableColorScheme />
                <App />
              </Hydrate>
            </QueryClientProvider>
          </ThemeProvider>
        </CacheProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

ReactDOM.hydrate(
  <React.StrictMode>
    <React.Suspense fallback="Loading...">
      <Main />
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById("root")
);

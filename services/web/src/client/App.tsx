import { ErrorBox } from "@liexp/ui/lib/components/Common/ErrorBox.js";
import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader.js";
import { Footer } from "@liexp/ui/lib/components/Footer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Grid, useMuiMediaQuery } from "@liexp/ui/lib/components/mui/index.js";
import { useTheme } from "@liexp/ui/lib/theme/index.js";
import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes } from "react-router";
import AppHeader, { logo192 } from "./components/header/AppHeader.js";
import NotFoundPage from "./pages/404.js";
import { routes } from "./routes.js";
import { webLogger } from "./utils/logger.utils.js";

import "@liexp/ui/lib/components/Common/Icons/library.js";
import "@liexp/ui/assets/main.css";
import "@liexp/ui/assets/blocknote.css";

export const App: React.FC<{ pathname: string }> = ({ pathname }) => {
  const theme = useTheme();
  const isDownSM = useMuiMediaQuery("min-width: 899px");

  webLogger.debug.log(`App rendered ${pathname}`);

  return (
    <div style={{ height: "100%", display: "flex" }}>
      <ErrorBoundary FallbackComponent={ErrorBox}>
        <SEO title="lies exposed" urlPath={pathname} />
        <AppHeader />
        <Routes>
          {routes.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={
                <React.Suspense fallback={<FullSizeLoader />}>
                  <Grid
                    container
                    style={{ minHeight: "100%", height: "100%", width: "100%" }}
                  >
                    <Grid
                      size={12}
                      style={{
                        width: "100%",
                        minHeight: "100%",
                        marginTop: theme.mixins.toolbar.height ?? 64 + 16,
                      }}
                    >
                      <r.route />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Footer
                        logoSrc={logo192}
                        style={{
                          paddingLeft:
                            pathname === "/events" && !isDownSM ? 240 : 0,
                        }}
                      />
                    </Grid>
                  </Grid>
                </React.Suspense>
              }
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

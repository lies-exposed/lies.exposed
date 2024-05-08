import "@liexp/ui/assets/main.css";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { ErrorBox } from "@liexp/ui/lib/components/Common/ErrorBox.js";
import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader.js";
import "@liexp/ui/lib/components/Common/Icons/library.js";
import { Footer } from "@liexp/ui/lib/components/Footer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Grid, useMuiMediaQuery } from "@liexp/ui/lib/components/mui/index.js";
import { useTheme } from "@liexp/ui/lib/theme/index.js";
import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Route, Routes, useLocation } from "react-router";
import AppHeader, { logo192 } from "./components/header/AppHeader.js";
import NotFoundPage from "./pages/404.js";
import { routes } from "./routes.js";

export const App: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isDownSM = useMuiMediaQuery("min-width: 899px");

  return (
    <div style={{ height: "100%", display: "flex" }}>
      <SEO title="lies exposed" urlPath={location.pathname} />
      <AppHeader />
      <Grid
        container
        style={{ minHeight: "100%", height: "100%", width: "100%" }}
      >
        <Grid
          item
          style={{
            width: "100%",
            // minHeight: `calc(100% - ${
            //   theme.mixins.toolbar.height ?? 64
            // }px - 100px)`,
            minHeight: "100%",
            // height: "100%",
            marginTop: theme.mixins.toolbar.height ?? 64 + 16,
          }}
        >
          <ErrorBoundary FallbackComponent={ErrorBox}>
            <Routes>
              {routes.map((r) => (
                <Route
                  key={r.path}
                  path={r.path}
                  element={
                    <React.Suspense fallback={<FullSizeLoader />}>
                      <r.route />
                    </React.Suspense>
                  }
                />
              ))}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </Grid>
        <Grid item xs={12}>
          <Footer
            logoSrc={logo192}
            style={{
              paddingLeft:
                location.pathname === "/events" && !isDownSM ? 240 : 0,
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

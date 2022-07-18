import "@liexp/ui/components/Common/Icons/library";
import { Footer } from "@liexp/ui/components/Footer";
import SEO from "@liexp/ui/components/SEO";
import { Grid, useMediaQuery } from "@liexp/ui/components/mui";
import { useTheme } from "@liexp/ui/theme";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Route, Routes, useLocation } from "react-router";
import AppHeader from "./components/header/AppHeader";
import { routes } from "./routes";

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  // eslint-disable-next-line no-console
  console.log(error);
  return (
    <>
      <div>{error.name}</div>
      <div>{error.message}</div>
    </>
  );
};

export const App: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isDownSM = useMediaQuery("min-width: 899px");

  return (
    <div style={{ height: "100%", display: "flex" }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SEO title="lies exposed" urlPath={location.pathname} />
        <Grid container style={{ minHeight: "100%", width: "100%" }}>
          <AppHeader />

          <Grid
            style={{
              width: "100%",
              minHeight: `calc(100% - ${
                theme.mixins.toolbar.height ?? 64
              }px - 100px)`,
              marginTop: theme.mixins.toolbar.height ?? 64,
              marginBottom: 100,
            }}
          >
            <Routes>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={<r.route />} />
              ))}
            </Routes>
          </Grid>
          <Grid item xs={12}>
            <Footer
              style={{
                paddingLeft:
                  location.pathname === "/events" && !isDownSM ? 240 : 0,
              }}
            />
          </Grid>
        </Grid>
      </ErrorBoundary>
    </div>
  );
};

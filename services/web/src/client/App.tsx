import "@liexp/ui/components/Common/Icons/library";
import { Footer } from "@liexp/ui/components/Footer";
import SEO from "@liexp/ui/components/SEO";
import { Grid, useMediaQuery, useTheme } from "@material-ui/core";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Route, Routes, useLocation } from "react-router-dom";
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
  const isDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div style={{ height: "100%", display: "flex" }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SEO title="lies exposed" urlPath={location.pathname} />
        <Grid container style={{ minHeight: "100%", width: "100%" }}>
          <AppHeader />
          {/* <Grid style={{ margin: 20 }}>
                     <BreadCrumb
                      view={currentView}
                      segments={{
                        events: ["dashboard", "events"],
                        event: ["dashboard", "events", ":eventId"],
                        actors: ["dashboard", "actors"],
                        actor: ["dashboard", "actors", ":actorId"],
                        groups: ["dashboard", "groups"],
                        group: ["dashboard", "groups", ":groupId"],
                        keywords: ["dashboard", "keywords"],
                        keyword: ["dashboard", "keywords", ":keywordId"],
                      }}
                    /> 
                    </Grid> */}

          <Grid
            style={{
              width: "100%",
              minHeight: `calc(100% - 64px)`,
              marginBottom: 50,
            }}
          >
            <Routes>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.route} />
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

import "@liexp/ui/components/Common/Icons/library";
import { Footer } from "@liexp/ui/components/Footer";
import { SEOHelmet } from '@liexp/ui/components/SEO';
import { Grid, useMediaQuery, useTheme } from "@material-ui/core";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Route, Switch, useLocation } from "react-router-dom";
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
      <SEOHelmet
        link={[
          {
            key: 'slick-carousel-css',
            rel: "stylesheet",
            type: "text/css",
            href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css",
          },
        ]}
      />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
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
              minHeight: 600,
              height: `calc(100% - 64px)`,
              marginBottom: 50,
            }}
          >
            <Switch>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} render={r.route} strict />
              ))}
            </Switch>
          </Grid>
          <Footer
            style={{
              paddingLeft:
                location.pathname === "/events" && !isDownSM ? 240 : 0,
            }}
          />
        </Grid>
      </ErrorBoundary>
    </div>
  );
};
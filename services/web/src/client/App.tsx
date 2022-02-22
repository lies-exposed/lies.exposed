import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import {
  FullSizeLoader,
  LazyFullSizeLoader,
} from "@econnessione/ui/components/Common/FullSizeLoader";
import "@econnessione/ui/components/Common/Icons/library";
import { Footer } from "@econnessione/ui/components/Footer";
import { Grid } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import * as Helmet from "react-helmet";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import AppHeader from "./components/header/AppHeader";
import IndexPage from "./pages";
import ProjectPage from "./pages/project";
import { routes } from "./routes";
import { CurrentView, currentView } from "./utils/location.utils";

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
  return (
    <div style={{ height: "100%", display: "flex" }}>
      <Helmet.Helmet
        link={[
          {
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
              height: `calc(100% - 64px)`,
            }}
          >
            <Switch>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} render={r.route} strict />
              ))}
            </Switch>
          </Grid>
          <Footer />
        </Grid>
      </ErrorBoundary>
    </div>
  );
};

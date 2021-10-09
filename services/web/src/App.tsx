import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { Footer } from "@econnessione/ui/components/Footer";
import Header from "@econnessione/ui/components/Header";
import { theme } from "@econnessione/ui/theme";
import { Grid, ThemeProvider } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import "ol/ol.css";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import * as Helmet from "react-helmet";
import IndexPage from "./pages";
import EventsPage from "./pages/EventsPage";
import { currentView } from "./utils/location.utils";
import "./scss/main.scss";

// import NotFoundPage from "./pages/404";

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
    <div style={{ height: "100%" }}>
      <Helmet.Helmet
        link={[
          {
            rel: "stylesheet",
            type: "text/css",
            href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css",
          },
          {
            rel: "stylesheet",
            type: "text/css",
            href: "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css",
          },
        ]}
      />
      {/* <CssBaseline /> */}
      <ThemeProvider theme={theme}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Header />
          <Grid style={{ minHeight: "100%" }}>
            <Grid item style={{ height: "100%" }}>
              <WithQueries
                queries={{ currentView: currentView }}
                render={QR.fold(
                  LazyFullSizeLoader,
                  ErrorBox,
                  ({ currentView }) => {
                    switch (currentView.view) {
                      case "events":
                        return <EventsPage {...currentView} />;

                      // case 'vaccines':
                      //   return <VaccineDashboard path="/dashboards/vaccines" />
                      //   <EventsPage path="/dashboards/events" />
                      // <EventTemplate {...currentView} />;
                      //   <DocsPage path="/docs" />
                      //   <ProjectTemplate path="/projects/:projectId" />
                      //   <ProjectsPage path="/projects" />
                      //   <ProjectPage path="/project" />
                      //   <TopicsPage path="/topics" />
                      //   <ArticleTemplate path="/blog/:articlePath" />
                      //   <BlogPage path="/blog" />
                      //   <AreasPage path="/areas" />
                      //   <AreaTemplate path="/areas/:areaId" />
                      //   <GroupTemplate path="/groups/:groupId" />
                      //   <GroupsPage path="/groups" />
                      //   <ActorTemplate path="/actors/:actorId" />
                      //   <ActorsPage path="/actors" />
                      //   <TheCrisisPage path="/the-crisis" />
                      default:
                        return <IndexPage default={true} />;
                    }
                  }
                )}
              />
            </Grid>
            <Footer />
          </Grid>
        </ErrorBoundary>
      </ThemeProvider>
    </div>
  );
};

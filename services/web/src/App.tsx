import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { Footer } from "@econnessione/ui/components/Footer";
import Header from "@econnessione/ui/components/Header";
import { theme } from "@econnessione/ui/theme";
import { Grid, ThemeProvider } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import * as Helmet from "react-helmet";
import IndexPage from "./pages";
import ActorsPage from "./pages/ActorsPage";
import EventsPage from "./pages/EventsPage";
import GroupsPage from "./pages/GroupsPage";
import { currentView } from "./utils/location.utils";
import ActorTemplate from "@templates/ActorTemplate";
import EventTemplate from "@templates/EventTemplate";
import GroupTemplate from "@templates/GroupTemplate";
import KeywordsPage from "pages/KeywordsPage";

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
                      case "actors":
                        return <ActorsPage />;
                      case "actor":
                        return <ActorTemplate actorId={currentView.actorId} />;
                      case "groups":
                        return <GroupsPage />;
                      case "group":
                        return <GroupTemplate groupId={currentView.groupId} />;
                      case "events":
                        return <EventsPage {...currentView} />;
                      case "event":
                        return <EventTemplate eventId={currentView.eventId} />;
                      case "keywords":
                        return <KeywordsPage />;
                      // case 'vaccines':
                      //   return <VaccineDashboard path="/dashboards/vaccines" />

                      //   <DocsPage path="/docs" />
                      //   <ProjectTemplate path="/projects/:projectId" />
                      //   <ProjectsPage path="/projects" />
                      //   <ProjectPage path="/project" />
                      //   <TopicsPage path="/topics" />
                      //   <ArticleTemplate path="/blog/:articlePath" />
                      //   <BlogPage path="/blog" />
                      //   <AreasPage path="/areas" />
                      //   <AreaTemplate path="/areas/:areaId" />
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

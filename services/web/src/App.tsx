import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { Footer } from "@econnessione/ui/components/Footer";
import Header, { HeaderMenuItem } from "@econnessione/ui/components/Header";
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
import KeywordsPage from "./pages/KeywordsPage";
import VaccineDashboard from "./pages/dashboards/VaccineDashboard";
import { currentView, doUpdateCurrentView } from "./utils/location.utils";
import ActorTemplate from "@templates/ActorTemplate";
import ArticleTemplate from "@templates/ArticleTemplate";
import EventTemplate from "@templates/EventTemplate";
import GroupTemplate from "@templates/GroupTemplate";
import BlogPage from "pages/BlogPage";
import { DocsPage } from "pages/DocsPage";
import ProjectPage from "pages/project";

const dataMenuItem = {
  view: "index",
  label: "Dashboards",
  subItems: [
    {
      view: "events",
      label: "Events",
    },
    {
      view: "vaccines-dashboard",
      label: "Covid19 Vaccines",
    },
  ],
};

const projectMenuItem = {
  view: "project",
  label: "Progetto",
  subItems: [
    {
      view: "docs",
      label: "Docs",
    },
  ],
};

export const mainMenu: HeaderMenuItem[] =
  process.env.NODE_ENV === "development"
    ? [
        projectMenuItem,
        {
          view: "blog",
          label: "Blog",
          subItems: [],
        },
        dataMenuItem,
      ]
    : [projectMenuItem, dataMenuItem];

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
          <Header
            menu={mainMenu}
            onTitleClick={() => {
              void doUpdateCurrentView({
                view: "index",
              })();
            }}
            onMenuItemClick={(m) => {
              void doUpdateCurrentView({
                view: m.view as any,
              })();
            }}
          />
          <Grid style={{ minHeight: "100%" }}>
            <Grid item style={{ height: "100%" }}>
              <WithQueries
                queries={{ currentView: currentView }}
                render={QR.fold(
                  LazyFullSizeLoader,
                  ErrorBox,
                  ({ currentView }) => {
                    switch (currentView.view) {
                      case "blog":
                        return <BlogPage />;
                      case "article":
                        return (
                          <ArticleTemplate
                            articlePath={currentView.articlePath}
                          />
                        );
                      case "docs":
                        return <DocsPage />;
                      case "about":
                        return <ProjectPage />;
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
                      case "vaccines-dashboard":
                        return <VaccineDashboard {...currentView} />;

                      //   <ProjectTemplate path="/projects/:projectId" />
                      //   <ProjectsPage path="/projects" />
                      //   <ProjectPage path="/project" />
                      //   <AreasPage path="/areas" />
                      //   <AreaTemplate path="/areas/:areaId" />
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

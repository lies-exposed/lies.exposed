import { BreadCrumb } from "@econnessione/ui/components/Common/BreadCrumb";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import "@econnessione/ui/components/Common/Icons/library";
import { Footer } from "@econnessione/ui/components/Footer";
import Header, { HeaderMenuItem } from "@econnessione/ui/components/Header";
import { ECOTheme } from "@econnessione/ui/theme";
import { CssBaseline, Grid, ThemeProvider } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import * as Helmet from "react-helmet";
import ActorsPage from "./pages/ActorsPage";
import BlogPage from "./pages/BlogPage";
import VaccineDashboard from "./pages/dashboards/VaccineDashboard";
import { DocsPage } from "./pages/DocsPage";
import EventsPage from "./pages/EventsPage";
import GroupsPage from "./pages/GroupsPage";
import KeywordsPage from "./pages/KeywordsPage";
import ProjectPage from "./pages/project";
import ActorTemplate from "./templates/ActorTemplate";
import ArticleTemplate from "./templates/ArticleTemplate";
import EventTemplate from "./templates/EventTemplate";
import GroupTemplate from "./templates/GroupTemplate";
import KeywordTemplate from "./templates/KeywordTemplate";
import {
  CurrentView,
  currentView,
  doUpdateCurrentView
} from "./utils/location.utils";

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
  label: "Project",
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

const getCurrentComponent = (currentView: CurrentView): React.ReactElement => {
  switch (currentView.view) {
    case "blog":
      return <BlogPage />;
    case "article":
      return <ArticleTemplate articlePath={currentView.articlePath} />;
    case "docs":
      return <DocsPage />;
    case "about":
      return <ProjectPage />;
    case "actors":
      return <ActorsPage />;
    case "actor":
      return <ActorTemplate {...currentView} />;
    case "groups":
      return <GroupsPage />;
    case "group":
      return <GroupTemplate {...currentView} />;
    case "event":
      return <EventTemplate eventId={currentView.eventId} />;
    case "keywords":
      return <KeywordsPage />;
    case "keyword":
      return <KeywordTemplate keywordId={currentView.keywordId} />;
    case "vaccines-dashboard":
      return <VaccineDashboard {...currentView} />;

    //   <ProjectTemplate path="/projects/:projectId" />
    //   <ProjectsPage path="/projects" />
    //   <ProjectPage path="/project" />
    //   <AreasPage path="/areas" />
    //   <AreaTemplate path="/areas/:areaId" />
    //   <TheCrisisPage path="/the-crisis" />

    case "events":
    default:
      return <EventsPage {...{ ...currentView, view: "events" }} />;
    // return <IndexPage default={true} />;
  }
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
      <CssBaseline />
      <ThemeProvider theme={ECOTheme}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <WithQueries
            queries={{ currentView: currentView }}
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ currentView }) => {
              return (
                <Grid container style={{ minHeight: "100%", width: "100%" }}>
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

                  <Grid style={{ margin: 20 }}>
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
                  </Grid>

                  <Grid style={{ minHeight: "100%", width: "100%" }}>
                    {getCurrentComponent(currentView)}
                  </Grid>
                  <Footer />
                </Grid>
              );
            })}
          />
        </ErrorBoundary>
      </ThemeProvider>
    </div>
  );
};

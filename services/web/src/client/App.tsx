import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import {
  FullSizeLoader,
  LazyFullSizeLoader,
} from "@econnessione/ui/components/Common/FullSizeLoader";
import "@econnessione/ui/components/Common/Icons/library";
import { Footer } from "@econnessione/ui/components/Footer";
import Header, { HeaderMenuItem } from "@econnessione/ui/components/Header";
import { Grid } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import * as Helmet from "react-helmet";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import IndexPage from './pages';
import ProjectPage from "./pages/project";
import {
  CurrentView,
  currentView,
  doUpdateCurrentView,
} from "./utils/location.utils";

const ActorsPage = React.lazy(() => import("./pages/ActorsPage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const DocsPage = React.lazy(() => import("./pages/DocsPage"));
const EventsPage = React.lazy(() => import("./pages/EventsPage"));
const GroupsPage = React.lazy(() => import("./pages/GroupsPage"));
const KeywordsPage = React.lazy(() => import("./pages/KeywordsPage"));
const VaccineDashboard = React.lazy(
  () => import("./pages/dashboards/VaccineDashboard")
);
const ActorTemplate = React.lazy(() => import("./templates/ActorTemplate"));
const ArticleTemplate = React.lazy(() => import("./templates/ArticleTemplate"));
const GroupTemplate = React.lazy(() => import("./templates/GroupTemplate"));
const KeywordTemplate = React.lazy(() => import("./templates/KeywordTemplate"));
const EventTemplate = React.lazy(() => import("./templates/EventTemplate"));

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
        // projectMenuItem,
        // {
        //   view: "blog",
        //   label: "Blog",
        //   subItems: [],
        // },
        // dataMenuItem,
      ]
    : [dataMenuItem];

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
      return <EventsPage {...{ ...(currentView as any) }} />;
    // return <IndexPage default={true} />;
  }
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
                  <React.Suspense fallback={<FullSizeLoader />}>
                    <BrowserRouter>
                      <Switch>
                        <Route path="/events" render={() => <EventsPage />} />
                        <Route render={(props) => <IndexPage />} />
                      </Switch>
                    </BrowserRouter>
                  </React.Suspense>
                </Grid>
                <Footer />
              </Grid>
            );
          })}
        />
      </ErrorBoundary>
    </div>
  );
};

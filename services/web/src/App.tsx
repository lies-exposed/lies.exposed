import { Footer } from "@econnessione/shared/components/Footer";
import Header from "@econnessione/shared/components/Header";
import { theme } from "@econnessione/shared/theme";
import { Grid, ThemeProvider } from "@material-ui/core";
import { Router } from "@reach/router";
import ActorTemplate from "@templates/ActorTemplate";
import AreaTemplate from "@templates/AreaTemplate";
import ArticleTemplate from "@templates/ArticleTemplate";
import EventTemplate from "@templates/EventTemplate";
import GroupTemplate from "@templates/GroupTemplate";
import ProjectTemplate from "@templates/ProjectTemplate";
import "ol/ol.css";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import Helmet from "react-helmet";
import IndexPage from "./pages";
import ActorsPage from "./pages/ActorsPage";
import BlogPage from "./pages/BlogPage";
import { DocsPage } from "./pages/DocsPage";
import EventsPage from "./pages/EventsPage";
import GroupsPage from "./pages/GroupsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TheCrisisPage from "./pages/TheCrisisPage";
import TopicsPage from "./pages/TopicsPage";
import AreasPage from "./pages/areas";
import { VaccineDashboard } from "./pages/dashboards/VaccineDashboard";
import ProjectPage from "./pages/project";
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
      <Helmet
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
              <Router>
                <EventTemplate path="/events/:eventId" />
                <VaccineDashboard path="/dashboards/vaccines" />
                <EventsPage path="/dashboards/events" />
                <DocsPage path="/docs" />
                <ProjectTemplate path="/projects/:projectId" />
                <ProjectsPage path="/projects" />
                <ProjectPage path="/project" />
                <TopicsPage path="/topics" />
                <ArticleTemplate path="/blog/:articlePath" />
                <BlogPage path="/blog" />
                <AreasPage path="/areas" />
                <AreaTemplate path="/areas/:areaId" />
                <GroupTemplate path="/groups/:groupId" />
                <GroupsPage path="/groups" />
                <ActorTemplate path="/actors/:actorId" />
                <ActorsPage path="/actors" />
                <TheCrisisPage path="/the-crisis" />
                <IndexPage default={true} />

                {/* <NotFoundPage default={true} /> */}
              </Router>
            </Grid>
            <Footer />
          </Grid>
        </ErrorBoundary>
      </ThemeProvider>
    </div>
  );
};

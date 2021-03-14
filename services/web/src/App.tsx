import { FullSizeLoader } from "@components/Common/FullSizeLoader";
import { Footer } from "@econnessione/shared/components/Footer";
import Header from "@econnessione/shared/components/Header";
import { Grid, ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Router } from "@reach/router";
import ActorTemplate from "@templates/ActorTemplate";
import ArticleTemplate from "@templates/ArticleTemplate";
import EventTemplate from "@templates/EventTemplate";
import GroupTemplate from "@templates/GroupTemplate";
import ProjectTemplate from "@templates/ProjectTemplate";
import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import Helmet from "react-helmet";
import IndexPage from "./pages";
import BlogPage from "./pages/BlogPage";
import { DocsPage } from "./pages/DocsPage";
import EventsPage from "./pages/EventsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TheCrisisPage from "./pages/TheCrisisPage";
import TopicsPage from "./pages/TopicsPage";
import ActorsPage from "./pages/actors";
import AreasPage from "./pages/areas";
import GroupsPage from "./pages/groups";
import ProjectPage from "./pages/project";
import { theme } from "./theme/CustomTheme";
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
            href:
              "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css",
          },
          {
            rel: "stylesheet",
            type: "text/css",
            href:
              "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css",
          },
        ]}
      />
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Header />
          <Grid style={{ minHeight: "100%" }}>
            <Grid item style={{ height: "100%" }}>
              <Router>
                <EventTemplate path="/events/:eventId" />
                <EventsPage path="/events" />
                <DocsPage path="/docs" />
                <ProjectTemplate path="/projects/:projectId" />
                <ProjectsPage path="/projects" />
                <ProjectPage path="/project" />
                <TopicsPage path="/topics" />
                <ArticleTemplate path="/blog/:articlePath" />
                <BlogPage path="/blog" />
                <AreasPage path="/areas" />
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

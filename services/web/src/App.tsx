import { Footer } from "@econnessione/shared/components/Footer";
import Header from "@econnessione/shared/components/Header";
import theme from "@econnessione/shared/theme/CustomTheme";
import { Router } from "@reach/router";
import ActorTemplate from "@templates/ActorTemplate";
import ArticleTemplate from "@templates/ArticleTemplate";
import EventTemplate from "@templates/EventTemplate";
import GroupTemplate from "@templates/GroupTemplate";
import ProjectTemplate from "@templates/ProjectTemplate";
import { BaseProvider } from "baseui";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
// import NotFoundPage from "./pages/404";
import * as React from "react";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
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


export const App: React.FC = () => {
  const engine = new Styletron();
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        <FlexGrid width="100%" minHeight="100%" margin="0">
          <FlexGridItem width="100%" minHeight="100%" flexDirection="column">
            <Header />
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
          </FlexGridItem>
          <Footer />
        </FlexGrid>
      </BaseProvider>
    </StyletronProvider>
  );
};

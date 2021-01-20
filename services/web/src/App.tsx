import { Footer } from "@components/Footer";
import Header from "@components/Header";
import { Router } from "@reach/router";
import ActorTemplate from "@templates/ActorTemplate";
import ProjectTemplate from "@templates/ProjectTemplate";
import theme from "@theme/CustomeTheme";
import { BaseProvider } from "baseui";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import NotFoundPage from "pages/404";
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
              <EventsPage path="/events" />
              <DocsPage path="/docs" />
              <ProjectTemplate path="/projects/:projectId" />
              <ProjectsPage path="/projects" />
              <ProjectPage path="/project" />
              <TopicsPage path="/topics" />
              <BlogPage path="/blog" />
              <AreasPage path="/areas" />
              <GroupsPage path="/groups" />
              <ActorTemplate path="/actors/:actorId" />
              <ActorsPage path="/actors" />
              <TheCrisisPage path="/the-crisis" />
              <IndexPage path="/" />
              <NotFoundPage default={true} />
            </Router>
          </FlexGridItem>
          <Footer />
        </FlexGrid>
      </BaseProvider>
    </StyletronProvider>
  );
};

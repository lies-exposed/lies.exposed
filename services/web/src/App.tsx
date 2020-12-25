import { Footer } from "@components/Footer"
import Header from "@components/Header"
import { RouteComponentProps, Router } from "@reach/router"
import ProjectTemplate from "@templates/ProjectTemplate"
import theme from "@theme/CustomeTheme"
import { BaseProvider } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import NotFoundPage from "pages/404"
import ArticlesPage from "pages/ArticlesPage"
import { DocsPage } from "pages/DocsPage"
import ProjectsPage from "pages/ProjectsPage"
import TheCrisisPage from "pages/TheCrisisPage"
import TopicsPage from "pages/TopicsPage"
import ActorsPage from "pages/actors"
import AdminPage from "pages/admin"
import AreasPage from "pages/areas"
import GroupsPage from "pages/groups"
import ProjectPage from "pages/project"
// import ActorsPage from "old-pages/actors"
import * as React from "react"
import { Client as Styletron } from "styletron-engine-atomic"
import { Provider as StyletronProvider } from "styletron-react"
import IndexPage from "./pages"

const AppRouter: React.FC<RouteComponentProps> = () => {
  const engine = new Styletron()
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={theme}>
        <FlexGrid width="100%" minHeight="100%" margin="0">
          <FlexGridItem width="100%" minHeight="100%" flexDirection="column">
            <Header />
            <Router>
              <DocsPage path="/docs" />
              <ProjectTemplate path="/projects/:projectId" />
              <ProjectsPage path="/projects" />
              <ProjectPage path="/project" />
              <TopicsPage path="/topics" />
              <ArticlesPage path="/articles" />
              <AreasPage path="/areas" />
              <GroupsPage path="/groups" />
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
  )
}

export const App: React.FC = () => {
  return (
    <Router>
      <AdminPage path="/admin/" />
      <AppRouter path="*" />
    </Router>
  )
}

import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { ContentWithSidebar } from "@econnessione/ui/components/ContentWithSidebar";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { ProjectsMap } from "@econnessione/ui/components/Map/ProjectsMap";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import { TableOfContents } from "@econnessione/ui/components/TableOfContents";
import ProjectList from "@econnessione/ui/components/lists/ProjectList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { navigate, RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export default class ProjectsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ page: pageContentByPath, projects: Queries.Project.getList }}
        params={{
          page: { path: "projects" },
          projects: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({ page, projects: { data: projects } }) => (
            <ContentWithSidebar
              sidebar={pipe(
                O.some({ items: [] }),
                O.chainNullableK((t) => t.items),
                O.fold(
                  () => <div />,
                  (items) => <TableOfContents items={items} />
                )
              )}
            >
              <SEO title={page.title} />
              <MainContent>
                <PageContent {...page} />
                <Autocomplete
                  id="combo-box-demo"
                  options={projects}
                  getOptionLabel={(option: any) => option.name}
                  style={{ width: 300, marginBottom: 40 }}
                  renderInput={(params: any) => (
                    <TextField {...params} label="Project" variant="outlined" />
                  )}
                  onSelect={async (event: any) => {
                    if (this.props.navigate !== undefined) {
                      // await navigateTo(this.props.navigate, "projects", item);
                    }
                  }}
                />
                <ProjectsMap
                  id="projects-page"
                  style={{ marginBottom: 40 }}
                  filter={{}}
                />
                <ProjectList
                  projects={projects.map((p) => ({ ...p, selected: false }))}
                  onProjectClick={async (p) => {
                    await navigate(`/projects/${p.id}`);
                  }}
                />
              </MainContent>
            </ContentWithSidebar>
          )
        )}
      />
    );
  }
}

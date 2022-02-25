import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { ContentWithSidebar } from "@liexp/ui/components/ContentWithSidebar";
import { MainContent } from "@liexp/ui/components/MainContent";
import { ProjectsMap } from "@liexp/ui/components/Map/ProjectsMap";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import { TableOfContents } from "@liexp/ui/components/TableOfContents";
import ProjectList from "@liexp/ui/components/lists/ProjectList";
import {
  pageContentByPath,
  Queries,
} from "@liexp/ui/providers/DataProvider";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { navigate, RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

export default class ProjectsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ projects: Queries.Project.getList }}
        params={{
          projects: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({ projects: { data: projects } }) => (
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
              <MainContent>
                <PageContent queries={{ pageContent: { path: "projects" } }} />
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

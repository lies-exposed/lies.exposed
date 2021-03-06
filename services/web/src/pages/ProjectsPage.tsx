import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { ContentWithSidebar } from "@econnessione/shared/components/ContentWithSidebar";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import { TableOfContents } from "@econnessione/shared/components/TableOfContents";
import ProjectList from "@econnessione/shared/components/lists/ProjectList";
import { pageContentByPath, projectList } from "@econnessione/shared/providers/DataProvider";
import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { navigate, RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export default class ProjectsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ page: pageContentByPath, projects: projectList }}
        params={{
          page: { path: "projects" },
          projects: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
        }}
        render={QR.fold(
          Loader,
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
                  style={{ width: 300 }}
                  renderInput={(params: any) => (
                    <TextField {...params} label="Project" variant="outlined" />
                  )}
                  onSelect={async (event: any) => {
                    // eslint-disable-next-line
                    console.log(event);
                    if (this.props.navigate !== undefined) {
                      // await navigateTo(this.props.navigate, "projects", item);
                    }
                  }}
                />
                <ProjectList
                  projects={projects.map((p) => ({ ...p, selected: false }))}
                  avatarScale="scale1600"
                  onProjectClick={async(p) => {
                    await navigate(`/projects/${p.id}`)
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

import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { ContentWithSidebar } from "@econnessione/shared/components/ContentWithSidebar";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import { TableOfContents } from "@econnessione/shared/components/TableOfContents";
import { ProjectListItem } from "@econnessione/shared/components/lists/ProjectList";
import { navigateTo } from "@econnessione/shared/utils/links";
import { pageContentByPath, projectList } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
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
        render={QR.fold(Loader, ErrorBox, ({ page, projects: { data: projects } }) => (
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
              <SearchableInput
                items={projects.map((a) => ({
                  ...a,
                  selected: true,
                }))}
                selectedItems={[]}
                getValue={(g) => g.name}
                onSelectItem={async (item) => {
                  if (this.props.navigate !== undefined) {
                    await navigateTo(this.props.navigate, "projects", item);
                  }
                }}
                onUnselectItem={() => {}}
                itemRenderer={(item, itemProps, index) => (
                  <ProjectListItem
                    item={item}
                    index={index}
                    avatarScale="scale1600"
                    onClick={async (item: any) => {
                      if (this.props.navigate !== undefined) {
                        await navigateTo(this.props.navigate, "projects", item);
                      }
                    }}
                  />
                )}
              />
            </MainContent>
          </ContentWithSidebar>
        ))}
      />
    );
  }
}

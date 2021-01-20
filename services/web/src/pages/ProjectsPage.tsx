import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { ContentWithSidebar } from "@components/ContentWithSidebar";
import { MainContent } from "@components/MainContent";
import { PageContent } from "@components/PageContent";
import SEO from "@components/SEO";
import SearchableInput from "@components/SearchableInput";
import { TableOfContents } from "@components/TableOfContents";
import { ProjectListItem } from "@components/lists/ProjectList";
import { pageContentByPath, projectList } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import { navigateTo } from "@utils/links";
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
        render={QR.fold(Loader, ErrorBox, ({ page, projects }) => (
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
                  ...a.frontmatter,
                  id: a.id,
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
                    onClick={async (item) => {
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

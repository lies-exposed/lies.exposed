import { ContentWithSidebar } from "@liexp/ui/lib/components/ContentWithSidebar.js";
import { TableOfContents } from "@liexp/ui/lib/components/TableOfContents.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";

export default class ProjectPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <>
        <ContentWithSidebar
          sidebar={pipe(
            // pageContent.tableOfContents,
            O.some({ items: [] }),
            O.chain((t) => O.fromNullable(t.items)),
            O.fold(
              () => <div />,
              (items) => <TableOfContents items={items} />,
            ),
          )}
        >
          <PageContentBox path="project" />
        </ContentWithSidebar>
      </>
    );
  }
}

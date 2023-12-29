import { ContentWithSidebar } from "@liexp/ui/lib/components/ContentWithSidebar";
import { TableOfContents } from "@liexp/ui/lib/components/TableOfContents";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox";
import { type RouteComponentProps } from "@reach/router";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";

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

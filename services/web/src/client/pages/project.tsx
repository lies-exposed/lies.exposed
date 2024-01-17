import { ContentWithSidebar } from "@liexp/ui/lib/components/ContentWithSidebar.js";
import { TableOfContents } from "@liexp/ui/lib/components/TableOfContents.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import { type RouteComponentProps } from "@reach/router";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
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

import { ContentWithSidebar } from "@liexp/ui/lib/components/ContentWithSidebar.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import { TableOfContents } from "@liexp/ui/lib/components/TableOfContents.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";

class DocsPage extends React.PureComponent<RouteComponentProps> {
  render(): React.ReactElement {
    return (
      <ContentWithSidebar
        sidebar={pipe(
          O.some({ items: [] }),
          O.chainNullableK((t) => t.items),
          O.fold(
            () => <div />,
            (items) => <TableOfContents items={items} />,
          ),
        )}
      >
        <MainContent>
          <PageContentBox path="docs" />
        </MainContent>
      </ContentWithSidebar>
    );
  }
}

export default DocsPage;

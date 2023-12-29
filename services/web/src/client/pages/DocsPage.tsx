import { ContentWithSidebar } from "@liexp/ui/lib/components/ContentWithSidebar";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import { TableOfContents } from "@liexp/ui/lib/components/TableOfContents";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox";
import { type RouteComponentProps } from "@reach/router";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";

class DocsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
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

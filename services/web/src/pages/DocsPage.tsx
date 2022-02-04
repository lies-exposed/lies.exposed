import { ContentWithSidebar } from "@econnessione/ui/components/ContentWithSidebar";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import { TableOfContents } from "@econnessione/ui/components/TableOfContents";
import { RouteComponentProps } from "@reach/router";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

export class DocsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
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
          <PageContent queries={{ pageContent: { path: "docs" } }} />
        </MainContent>
      </ContentWithSidebar>
    );
  }
}

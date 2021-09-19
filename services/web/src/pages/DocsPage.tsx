import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { ContentWithSidebar } from "@econnessione/ui/components/ContentWithSidebar";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import { TableOfContents } from "@econnessione/ui/components/TableOfContents";
import { pageContentByPath } from "@econnessione/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export class DocsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          pageContent: pageContentByPath,
        }}
        params={{ pageContent: { path: "docs" } }}
        render={QR.fold(Loader, ErrorBox, ({ pageContent }) => (
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
              <SEO title={pageContent.title} />
              <PageContent {...pageContent} />
            </MainContent>
          </ContentWithSidebar>
        ))}
      />
    );
  }
}

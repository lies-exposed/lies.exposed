import { pageContentByPath } from "@econnessione/shared/providers/DataProvider";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { ContentWithSidebar } from "@econnessione/ui/components/ContentWithSidebar";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import { TableOfContents } from "@econnessione/ui/components/TableOfContents";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export default class ProjectPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          pageContentByPath,
        }}
        params={{ pageContentByPath: { path: "project" } }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ pageContentByPath: pageContent }) => (
            <>
              <SEO title={pageContent.title} />
              <ContentWithSidebar
                sidebar={pipe(
                  // pageContent.tableOfContents,
                  O.some({ items: [] }),
                  O.chain((t) => O.fromNullable(t.items)),
                  O.fold(
                    () => <div />,
                    (items) => <TableOfContents items={items} />
                  )
                )}
              >
                <PageContent {...pageContent} />
              </ContentWithSidebar>
            </>
          )
        )}
      />
    );
  }
}

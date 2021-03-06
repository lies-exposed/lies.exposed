import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { ContentWithSidebar } from "@econnessione/shared/components/ContentWithSidebar";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import { TableOfContents } from "@econnessione/shared/components/TableOfContents";
import { pageContentByPath } from "@econnessione/shared/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

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

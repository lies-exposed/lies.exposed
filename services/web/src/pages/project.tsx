import { ErrorBox } from "@components/Common/ErrorBox"
import { Loader } from "@components/Common/Loader"
import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import { pageContent } from "@providers/DataProvider"
import { RouteComponentProps } from "@reach/router"
import * as QR from "avenger/lib/QueryResult"
import { WithQueries } from "avenger/lib/react"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import React from "react"

export default class ProjectPage extends React.PureComponent<
  RouteComponentProps
> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          pageContent,
        }}
        params={{ pageContent: { id: "project" } }}
        render={QR.fold(Loader, ErrorBox, ({ pageContent }) => (
          <>
            <SEO title={pageContent.frontmatter.title} />
            <ContentWithSidebar
              sidebar={pipe(
                pageContent.tableOfContents,
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
        ))}
      />
    )
  }
}

import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import * as QR from "avenger/lib/QueryResult"
import { useQuery } from "avenger/lib/react"
import { Spinner } from "baseui/icon"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import React from "react"
import { onePage } from '../providers/DataProvider'

const ProjectPage: React.FC<PageProps> = (props) => {
  console.log(props)
  
  return (
    <Layout>
      {pipe(
        useQuery(onePage, {
          id: "project",
        }),
        QR.fold(
          () => <Spinner />,
          () => <p>there was a problem when fetching preferences</p>,
          (page) => (
            <>
              <SEO title={page.frontmatter.title} />
              <ContentWithSidebar
                sidebar={pipe(
                  page.tableOfContents,
                  O.chain((t) => O.fromNullable(t.items)),
                  O.fold(
                    () => <div />,
                    (items) => <TableOfContents items={items} />
                  )
                )}
              >
                <PageContent {...page} />
              </ContentWithSidebar>
            </>
          )
        )
      )}
    </Layout>
  )
}

export const pageQuery = null

export default ProjectPage

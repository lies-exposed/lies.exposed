import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import { PageContentFileNode } from "@models/page"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as O from 'fp-ts/lib/Option'
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import React from "react"

interface Results {
  pageContent: unknown
}

const DocsPage: React.FC<PageProps> = (props) => {
  const { pageContent }: Results = useStaticQuery(graphql`
    query DocsPage {
      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "docs" }
      ) {
        ...PageFileNode
      }
    }
  `)

  return pipe(
    PageContentFileNode.decode(pageContent),
    E.fold(renderValidationErrors, (page) => {
      return (
        <Layout>
          <SEO title={page.childMdx.frontmatter.title} />
          <ContentWithSidebar
            sidebar={pipe(
              O.fromNullable(page.childMdx.tableOfContents.items),
              O.fold(
                () => <div />,
                (items) => <TableOfContents items={items} />
              )
            )}
          >
            <PageContent {...page.childMdx} />
          </ContentWithSidebar>
        </Layout>
      )
    })
  )
}

export default DocsPage

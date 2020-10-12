import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import { PageContentFileNode } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import React from "react"

interface Results {
  pageContent: PageContentFileNode
}

const CrisisPage: React.FC<PageProps> = (props) => {
  const { pageContent }: Results = useStaticQuery(graphql`
    query CrisisQuery {
      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "the-crisis" }
      ) {
        ...PageFileNode
      }
    }
  `)

  return pipe(
    PageContentFileNode.decode(pageContent),
    E.fold(throwValidationErrors, () => {
      return (
        <Layout>
          <SEO title={pageContent.childMdx.frontmatter.title} />
          <ContentWithSidebar
            sidebar={
              <TableOfContents {...pageContent.childMdx.tableOfContents} />
            }
          >
            <MainContent>
              <PageContent {...pageContent.childMdx} />
            </MainContent>
          </ContentWithSidebar>
        </Layout>
      )
    })
  )
}

export default CrisisPage

import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
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
    query ProjectPage {
      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "the-crisis" }
      ) {
        ...PageContentFileNode
      }
    }
  `)

  return pipe(
    PageContentFileNode.decode(pageContent),
    E.fold(throwValidationErrors, () => {
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
          <ContentWithSidebar
            sidebar={
              <div
                dangerouslySetInnerHTML={{
                  __html: pageContent.childMarkdownRemark.tableOfContents,
                }}
              />
            }
          >
            <PageContent {...pageContent.childMarkdownRemark} />
          </ContentWithSidebar>
        </Layout>
      )
    })
  )
}

export default CrisisPage

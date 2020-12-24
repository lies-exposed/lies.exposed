import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import { PageMD } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import React from "react"

interface Results {
  pageContent: {childMdx:unknown}
}

const ProjectPage: React.FC<PageProps> = (props) => {
  const pageContent = { childMdx: undefined }
  // const { pageContent }: Results = useStaticQuery(graphql`
  //   query ProjectPage {
  //     pageContent: file(
  //       sourceInstanceName: { eq: "pages" }
  //       name: { eq: "project" }
  //     ) {
  //       childMdx {
  //         ...PageMD
  //       }
  //     }
  //   }
  // `)

  return pipe(
    PageMD.decode(pageContent.childMdx),
    E.fold(throwValidationErrors, (page) => {
      return (
        <Layout>
          <SEO title={page.frontmatter.title} />
          <ContentWithSidebar
            sidebar={pipe(
              page.tableOfContents,
              O.mapNullable(t => t.items),
              O.fold(
                () => <div />,
                (items) => <TableOfContents items={items} />
              )
            )}
          >
            <PageContent {...page} />
          </ContentWithSidebar>
        </Layout>
      )
    })
  )
}

export default ProjectPage

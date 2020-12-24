import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import { PageMD } from "@models/page"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import * as O from 'fp-ts/lib/Option'
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import React from "react"

// interface Results {
//   pageContent: { childMdx: unknown}
// }

const DocsPage: React.FC<PageProps> = (props) => {
  // const { pageContent }: Results = useStaticQuery(graphql`
  //   query DocsPage {
  //     pageContent: file(
  //       sourceInstanceName: { eq: "pages" }
  //       name: { eq: "docs" }
  //     ) {
  //       childMdx {
  //         ...PageMD
  //       }
  //     }
  //   }
  // `)

  const pageContent = { childMdx: undefined }
  return pipe(
    PageMD.decode(pageContent.childMdx),
    E.fold(renderValidationErrors, (page) => {
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

export default DocsPage

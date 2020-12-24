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

// interface Results {
//   pageContent: { childMdx: unknown }
// }

const CrisisPage: React.FC<PageProps> = (props) => {
  // const results: Results = useStaticQuery(graphql`
  //   query CrisisQuery {
  //     pageContent: file(
  //       sourceInstanceName: { eq: "pages" }
  //       name: { eq: "the-crisis" }
  //     ) {
  //       childMdx {
  //         ...PageMD
  //       }
  //     }
  //   }
  // `)

  const results = { pageContent: { childMdx: undefined } }
  
  return pipe(
    PageMD.decode(results.pageContent.childMdx),
    E.fold(throwValidationErrors, (pageContent) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.title} />
          <ContentWithSidebar
            sidebar={pipe(
              pageContent.tableOfContents,
              O.mapNullable((t) => t.items),
              O.fold(
                () => <div />,
                (items) => <TableOfContents items={items} />
              )
            )}
          >
            <PageContent {...pageContent} />
          </ContentWithSidebar>
        </Layout>
      )
    })
  )
}

export default CrisisPage

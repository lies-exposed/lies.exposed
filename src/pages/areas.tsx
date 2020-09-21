import AreasMap from "@components/AreasMap"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { AreaFrontmatter } from "@models/area"
import { PageContentFileNode } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, PageProps, useStaticQuery } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  areas: { nodes: unknown[] }
  pageContent: PageContentFileNode
}

const AreasPage: React.FC<PageProps> = ({ navigate }) => {
  const results = useStaticQuery<Results>(graphql`
    query AreasPage {
      areas: allAreaFrontmatter {
        nodes {
          ...Area
        }
      }

      pageContent: file(
        childMarkdownRemark: { fields: { collection: { eq: "pages" } } }
        name: { eq: "areas" }
      ) {
        ...PageFileNode
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      areas: t.array(AreaFrontmatter).decode(results.areas.nodes),
      pageContent: PageContentFileNode.decode(results.pageContent),
    }),
    E.fold(throwValidationErrors, ({ areas, pageContent }) => {

      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
          <MainContent>
            <PageContent {...pageContent.childMarkdownRemark} />
            <AreasMap areas={areas} width={800} height={400} />
          </MainContent>
        </Layout>
      )
    })
  )
}

export default AreasPage

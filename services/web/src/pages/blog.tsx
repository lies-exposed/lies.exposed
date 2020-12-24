import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ArticleFrontmatter } from "@models/article"
import { PageMD } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { Block } from "baseui/block"
import { Card, StyledBody } from "baseui/card"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { Link } from "gatsby"
import * as t from "io-ts"
import React from "react"

const ArticlesPage: React.FunctionComponent = () => {
  // const data: Results = useStaticQuery(graphql`
  //   query ArticlePage {
  //     articles: allArticleFrontmatter(filter: { draft: { eq: false } }) {
  //       nodes {
  //         ...Article
  //       }
  //     }

  //     pageContent: file(
  //       childMdx: { fields: { collection: { eq: "pages" } } }
  //       name: { eq: "blog" }
  //     ) {
  //       childMdx {
  //         ...PageMD
  //       }
  //     }
  //   }
  // `)

  const data = {
    pageContent: { childMdx: undefined },
    articles: { nodes: [] },
  }

  return pipe(
    sequenceS(E.either)({
      pageContent: PageMD.decode(data.pageContent.childMdx),
      articles: t.array(ArticleFrontmatter).decode(data.articles.nodes),
    }),
    E.fold(throwValidationErrors, ({ pageContent, articles }) => (
      <Layout>
        <SEO title="Article" />
        <MainContent>
          <PageContent {...pageContent} />
          <Block>
            <FlexGrid flexGridColumnCount={2}>
              {articles.map((a) => (
                <FlexGridItem key={a.uuid}>
                  <Card
                    key={a.uuid}
                    title={<Link to={`/blog/${a.path}`}>{a.title}</Link>}
                    headerImage={a.featuredImage.publicURL}
                  >
                    <StyledBody>{a.title}</StyledBody>
                  </Card>
                </FlexGridItem>
              ))}
            </FlexGrid>
          </Block>
        </MainContent>
      </Layout>
    ))
  )
}

export default ArticlesPage

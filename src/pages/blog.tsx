import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ArticleFrontmatter } from "@models/article"
import { PageContentFileNode } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { Block } from "baseui/block"
import { Card, StyledBody } from "baseui/card"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, Link, useStaticQuery } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  articles: { nodes: unknown[] }
  pageContent: unknown
}

const ArticlesPage: React.FunctionComponent = () => {
  const data: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allArticleFrontmatter(filter: { draft: { eq: false } }) {
        nodes {
          ...Article
        }
      }

      pageContent: file(
        childMarkdownRemark: { fields: { collection: { eq: "pages" } } }
        name: { eq: "blog" }
      ) {
        ...PageFileNode
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      pageContent: PageContentFileNode.decode(data.pageContent),
      articles: t.array(ArticleFrontmatter).decode(data.articles.nodes),
    }),
    E.fold(throwValidationErrors, ({ pageContent, articles }) => (
      <Layout>
        <SEO title="Article" />
        <MainContent>
          <PageContent {...pageContent.childMarkdownRemark} />
          <Block>
            {articles.map((a) => (
              <Card
                key={a.uuid}
                title={<Link to={`/blog/${a.path}`}>{a.title}</Link>}
              >
                <StyledBody>{a.title}</StyledBody>
              </Card>
            ))}
          </Block>
        </MainContent>
      </Layout>
    ))
  )
}

export default ArticlesPage

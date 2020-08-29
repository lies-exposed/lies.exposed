import { ArticlePage } from "@components/ArticlePage"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { ArticleMarkdownRemark } from "@models/article"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import React from "react"

interface ArticleTemplatePageProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMarkdownRemark: ArticleMarkdownRemark }
    // articles: {
    //   nodes: Array<{ childMarkdownRemark: { frontmatter: unknown } }>
    // }
  }
}

const ArticleTemplatePage: React.FC<ArticleTemplatePageProps> = (props) => {
  return pipe(
    sequenceS(E.either)({
      pageContent: ArticleMarkdownRemark.decode(props.data.pageContent.childMarkdownRemark),
      // articles: t
      //   .array(ArticleFileNodeChildMarkdownRemark)
      //   .decode(props.data.articles.nodes.map(n => n.childMarkdownRemark)),
    }),
    E.map(({ pageContent }) => {
      return {
        pageContent,
        // articles: articles.map(n => ({
        //   id: n.id,
        //   path: n.frontmatter.path,
        //   title: n.frontmatter.title,
        //   items: [],
        // })),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent }) => (
      <Layout>
        <SEO title="Home" />
        <ArticlePage {...pageContent} />
      </Layout>
    ))
  )
}

export const pageQuery = graphql`
  query($articleUUID: String!) {
    pageContent: file(
      name: { eq: $articleUUID }
    ) {
      childMarkdownRemark {
        ...ArticleMarkdownRemark
      }
    }

    articles: allArticleFrontmatter {
      nodes {
        ...Article
      }
    }
  }
`

export default ArticleTemplatePage

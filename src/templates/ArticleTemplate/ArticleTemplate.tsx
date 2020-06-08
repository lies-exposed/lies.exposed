import { ArticlePage } from "@components/ArticlePage"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { ArticleFileNodeChildMarkdownRemark } from "@models/article"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import React from "react"

interface ArticleTemplatePageProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: unknown
    // articles: {
    //   nodes: Array<{ childMarkdownRemark: { frontmatter: unknown } }>
    // }
  }
}

const ArticleTemplatePage: React.FC<ArticleTemplatePageProps> = props => {
  return pipe(
    sequenceS(E.either)({
      pageContent: ArticleFileNodeChildMarkdownRemark.decode(
        props.data.pageContent
      ),
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

        <ArticlePage
          {...pageContent.frontmatter}
          htmlAst={pageContent.htmlAst}
        />
      </Layout>
    ))
  )
}

export const pageQuery = graphql`
  query($filePath: String!) {
    pageContent: markdownRemark(frontmatter: { path: { eq: $filePath } }) {
      id
      htmlAst
      frontmatter {
        path
        title
        date
      }
    }

    articles: allFile(filter: { relativeDirectory: { eq: "articles" } }) {
      nodes {
        ...ArticleFileNode
      }
    }
  }
`

export default ArticleTemplatePage

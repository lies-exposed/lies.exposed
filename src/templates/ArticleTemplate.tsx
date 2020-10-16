import { ArticlePageContent } from "@components/ArticlePageContent"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { ArticleMD } from "@models/article"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import React from "react"

interface ArticleTemplatePageProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: ArticleMD }
    // articles: {
    //   nodes: Array<{ childMdx: { frontmatter: unknown } }>
    // }
  }
}

const ArticleTemplatePage: React.FC<ArticleTemplatePageProps> = (props) => {
  return pipe(
    sequenceS(E.either)({
      pageContent: ArticleMD.decode(props.data.pageContent.childMdx),
      // articles: t
      //   .array(ArticleFileNodechildMdx)
      //   .decode(props.data.articles.nodes.map(n => n.childMdx)),
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
        <ArticlePageContent {...pageContent} />
      </Layout>
    ))
  )
}

export const pageQuery = graphql`
  query($articleUUID: String!) {
    pageContent: file(
      name: { eq: $articleUUID }
    ) {
      childMdx {
        ...ArticleMD
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

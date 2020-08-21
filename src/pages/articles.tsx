import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ArticleMarkdownRemark } from "@models/article"
import { PageContentFileNode } from "@models/page"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  articles: { nodes: ArticleMarkdownRemark[] }
  pageContent: PageContentFileNode
}

const ArticlesPage: React.FunctionComponent = () => {
  const { articles, pageContent }: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allMarkdownRemark(
        filter: {
          frontmatter: { draft: { eq: false } }
          fields: { collection: { eq: "articles" } }
        }
      ) {
        nodes {
          ...ArticleMarkdownRemark
        }
      }

      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "articles" }
      ) {
        ...PageContentFileNode
      }
    }
  `)

  const articleItems = articles.nodes.map((n) => ({
    itemId: `/articles/${n.frontmatter.path}`,
    title: n.frontmatter.title,
    subNav: [],
  }))

  return (
    <Layout>
      <SEO title="Article" />
      <ContentWithSideNavigation items={articleItems}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default ArticlesPage

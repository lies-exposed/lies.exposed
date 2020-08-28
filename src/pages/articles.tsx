import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ArticleMarkdownRemark, ArticleFrontmatter } from "@models/article"
import { PageContentFileNode } from "@models/page"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  articles: { nodes: ArticleFrontmatter[] }
  pageContent: PageContentFileNode
}

const ArticlesPage: React.FunctionComponent = () => {
  const { articles, pageContent }: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allArticleFrontmatter(filter: { draft: { eq: false } }) {
        nodes {
          ...Article
        }
      }

      pageContent: file(
        childMarkdownRemark: { fields: { collection: { eq: "pages" } } }
        name: { eq: "articles" }
      ) {
        ...PageFileNode
      }
    }
  `)

  const articleItems = articles.nodes.map((n) => ({
    itemId: `/articles/${n.path}`,
    title: n.title,
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

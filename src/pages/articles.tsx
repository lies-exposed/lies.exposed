import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ArticleFileNode } from "@models/article"
import { PageContentFileNode } from "@models/page"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  articles: { nodes: ArticleFileNode[] }
  pageContent: PageContentFileNode
}

const ArticlesPage: React.FunctionComponent = () => {
  const { articles, pageContent }: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allFile(
        filter: {
          relativeDirectory: { eq: "articles" }
          childMarkdownRemark: { frontmatter: { draft: { eq: false } } }
        }
      ) {
        nodes {
          ...ArticleFileNode
        }
      }

      pageContent: file(relativePath: { eq: "pages/articles.md" }) {
        ...PageContentFileNode
      }
    }
  `)

  const articleItems = articles.nodes.map((n) => ({
    itemId: `/articles/${n.childMarkdownRemark.frontmatter.path}`,
    title: n.childMarkdownRemark.frontmatter.title,
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

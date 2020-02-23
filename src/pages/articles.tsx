import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { ArticleFileNode } from "@models/article"
import { PageContent } from "@models/pageContent"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  articles: { nodes: ArticleFileNode[] }
  pageContent: { nodes: PageContent[] }
}

const ArticlesPage: React.FunctionComponent = () => {
  const { articles, pageContent }: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allFile(filter: { relativeDirectory: { eq: "articles" } }) {
        nodes {
          id
          childMarkdownRemark {
            frontmatter {
              title
              path
            }
            htmlAst
          }
        }
      }

      pageContent: allMarkdownRemark(
        filter: { frontmatter: { path: { eq: "/articles" } } }
      ) {
        nodes {
          htmlAst
        }
      }
    }
  `)

  const articleItems = articles.nodes.map(n => ({
    itemId: n.childMarkdownRemark.frontmatter.path,
    path: `/articles/${n.childMarkdownRemark.frontmatter.path}`,
    title: n.childMarkdownRemark.frontmatter.title,
    subNav: [],
  }))

  const { htmlAst } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title="Article" />
      <ContentWithSideNavigation items={articleItems}>
        {renderMarkdownAST(htmlAst)}
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default ArticlesPage

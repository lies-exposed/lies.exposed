import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { Columns } from "react-bulma-components"
import Menu from "../components/Menu"
import { useStaticQuery, graphql } from "gatsby"

interface ArticlePageProps {}

interface Node {
  id: string
  frontmatter: {
    path: string
    title: string
  }
}

interface ArticleNode {
  html: string
}

interface Results {
  articles: { nodes: Node[] }
  pageContent: { nodes: ArticleNode[] }
}

const ArticlesPage = ({}: ArticlePageProps) => {
  const { articles, pageContent }: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allMarkdownRemark(
        filter: { frontmatter: { path: { ne: "/articles" } } }
      ) {
        nodes {
          id
          frontmatter {
            title
            path
          }
        }
      }

      pageContent: allMarkdownRemark(
        filter: { frontmatter: { path: { eq: "/articles" } } }
      ) {
        nodes {
          html
        }
      }
    }
  `)

  const articleItems = articles.nodes.map(n => ({
    id: n.id,
    path: n.frontmatter.path,
    title: n.frontmatter.title,
    items: [],
  }))

  const { html } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title="Article" />
      <Columns.Column size={3}>
        <Menu items={articleItems} />
      </Columns.Column>
      <Columns.Column size={9}>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: html }}
        ></div>
      </Columns.Column>
    </Layout>
  )
}

export default ArticlesPage

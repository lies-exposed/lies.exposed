import { useStaticQuery, graphql } from "gatsby"
import React from "react"
import { Columns } from "../components/Common"
import Menu from "../components/Common/Menu"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import renderMarkdownAST from "../utils/renderMarkdownAST"

interface Node {
  id: string
  frontmatter: {
    path: string
    title: string
  }
}

interface ArticleNode {
  htmlAst: string
}

interface Results {
  articles: { nodes: Node[] }
  pageContent: { nodes: ArticleNode[] }
}

const ArticlesPage: React.FunctionComponent = () => {
  const { articles, pageContent }: Results = useStaticQuery(graphql`
    query ArticlePage {
      articles: allMarkdownRemark(
        filter: { fileAbsolutePath: { glob: "**/articles/**" } }
      ) {
        nodes {
          id
          fileAbsolutePath
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
          htmlAst
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

  const { htmlAst } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title="Article" />
      <Columns>
        <Columns.Column size={3}>
          <Menu sections={[{ items: articleItems }]} />
        </Columns.Column>
        <Columns.Column size={9}>
          <div className="content">{renderMarkdownAST(htmlAst)}</div>
        </Columns.Column>
      </Columns>
    </Layout>
  )
}

export default ArticlesPage

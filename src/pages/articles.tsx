import Menu from "@components/Common/Menu"
import Layout from "@components/Layout"
import SEO from "@components/SEO"
import { ArticleFileNode } from "@models/article"
import { PageContent } from "@models/pageContent"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
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
    id: n.childMarkdownRemark.id,
    path: `/articles/${n.childMarkdownRemark.frontmatter.path}`,
    title: n.childMarkdownRemark.frontmatter.title,
    items: [],
  }))

  const { htmlAst } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title="Article" />
      <FlexGrid
        flexGridColumnCount={3}
        flexGridColumnGap="scale800"
        flexGridRowGap="scale800"
        marginBottom="scale800"
      >
        <FlexGridItem display="flex">
          <Menu sections={[{ items: articleItems }]} />
        </FlexGridItem>
        <FlexGridItem display="none">
          This invisible one is needed so the margins line up
        </FlexGridItem>
        <FlexGridItem
          display="flex"
          overrides={{
            Block: {
              style: ({ $theme }: { $theme: Theme }) => {
                return { width: `calc((200% - ${$theme.sizing.scale800}) / 3)` }
              },
            },
          }}
        >
          <div className="content">{renderMarkdownAST(htmlAst)}</div>
        </FlexGridItem>
      </FlexGrid>
    </Layout>
  )
}

export default ArticlesPage

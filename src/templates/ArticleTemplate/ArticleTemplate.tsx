import Menu from "@components/Common/Menu"
import Layout from "@components/Layout"
import SEO from "@components/SEO"
import renderMarkdownAST from "@utils//renderMarkdownAST"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import { HeadingXXLarge } from "baseui/typography"
import { graphql } from "gatsby"
import React from "react"

interface ArticleTemplatePage {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    markdownRemark: {
      frontmatter: { path: string; title: string; date: string }
      htmlAst: string
    }
    allMarkdownRemark: {
      nodes: [
        {
          id: string
          frontmatter: { path: string; title: string }
        }
      ]
    }
  }
}

export default function ArticleTemplatePage(
  props: ArticleTemplatePage
): React.ReactElement {
  const { markdownRemark, allMarkdownRemark } = props.data // data.markdownRemark holds your post data
  const { frontmatter, htmlAst } = markdownRemark
  const articleItems = allMarkdownRemark.nodes.map(n => ({
    id: n.id,
    path: n.frontmatter.path,
    title: n.frontmatter.title,
    items: [],
  }))

  return (
    <Layout>
      <SEO title="Home" />
      <FlexGrid flexGridColumnCount={3}>
        <FlexGridItem>
          <Menu sections={[{ items: articleItems }]} />
        </FlexGridItem>
        <FlexGridItem
          overrides={{
            Block: {
              style: ({ $theme }: { $theme: Theme }) => ({
                width: `calc((200% - ${$theme.sizing.scale800}) / 3)`,
              }),
            },
          }}
        >
          <HeadingXXLarge>{frontmatter.title}</HeadingXXLarge>
          {renderMarkdownAST(htmlAst)}
        </FlexGridItem>
        <FlexGridItem display="none" />
      </FlexGrid>
    </Layout>
  )
}

export const pageQuery = graphql`
  query($filePath: String!) {
    markdownRemark(frontmatter: { path: { eq: $filePath } }) {
      htmlAst
      frontmatter {
        path
        title
      }
    }

    allMarkdownRemark(
      filter: { fileAbsolutePath: { glob: "**/articles/**" } }
    ) {
      nodes {
        id
        frontmatter {
          path
          type
          title
          date(formatString: "DD/MM/YYYY")
        }
        fileAbsolutePath
      }
    }
  }
`

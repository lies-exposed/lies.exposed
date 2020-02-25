import Menu from "@components/Common/Menu"
import Layout from "@components/Layout"
import SEO from "@components/SEO"
import { PageContentNode } from "@models/PageContent"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  networks: { nodes: Array<{ id: string; name: string }> }
  pageContent: PageContentNode
}

const NetworksPage: React.FunctionComponent<{}> = _props => {
  const { networks, pageContent }: Results = useStaticQuery(graphql`
    query NetworksPage {
      networks: allDirectory(
        filter: { relativeDirectory: { glob: "events/networks" } }
      ) {
        nodes {
          id
          name
        }
      }

      pageContent: markdownRemark(
        fileAbsolutePath: { glob: "**/pages/networks.md" }
      ) {
        htmlAst
        frontmatter {
          title
          path
        }
      }
    }
  `)

  const {
    frontmatter: { title },
    htmlAst,
  } = pageContent

  const items = networks.nodes.map(n => ({
    id: n.id,
    path: `/networks/${n.name}`,
    title: n.name,
    items: [],
  }))

  return (
    <Layout>
      <SEO title={title} />
      <FlexGrid flexGridColumnCount={3}>
        <FlexGridItem>
          <Menu sections={[{ items }]} />
        </FlexGridItem>
        <FlexGridItem display="none">
          This invisible one is needed so the margins line up
        </FlexGridItem>
        <FlexGridItem
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

export default NetworksPage

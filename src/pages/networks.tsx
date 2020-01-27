import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { PageContentNode } from "@models/PageContent"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"
import { NetworkNode } from "types/networks"

interface Results {
  networks: { nodes: NetworkNode[] }
  pageContent: PageContentNode
}

const NetworksPage: React.FunctionComponent<{}> = _props => {
  const { networks: items, pageContent }: Results = useStaticQuery(graphql`
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

  const navigatorItems = [
    {
      itemId: "#networks-page-menu",
      title: "Networs",
      subNav: items.nodes.map(n => ({
        itemId: `/networks/${n.name}`,
        title: n.name,
        subNav: [],
      })),
    },
  ]

  return (
    <Layout>
      <SEO title={title} />
      <ContentWithSideNavigation items={navigatorItems}>
        {renderMarkdownAST(htmlAst)}
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default NetworksPage

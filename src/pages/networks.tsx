import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { PageContentNode } from "@models/PageContent"
import { NetworkPageContentFileNode } from "@models/networks"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  networks: { nodes: NetworkPageContentFileNode[] }
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
        itemId: `/networks/${n.childMarkdownRemark.frontmatter.slug}`,
        title: n.childMarkdownRemark.frontmatter.slug,
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

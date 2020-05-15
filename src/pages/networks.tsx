import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { NetworkPageContentFileNode } from "@models/networks"
import { PageContentFileNode } from "@models/page"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  networks: { nodes: NetworkPageContentFileNode[] }
  pageContent: PageContentFileNode
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

      pageContent: file(
        relativeDirectory: { eq: "pages" }
        name: { eq: "networks" }
      ) {
        ...PageContentFileNode
      }
    }
  `)

  const navigatorItems = [
    {
      itemId: "#networks-page-menu",
      title: "Networks",
      subNav: items.nodes.map(n => ({
        itemId: `/networks/${n.childMarkdownRemark.frontmatter.slug}`,
        title: n.childMarkdownRemark.frontmatter.slug,
        subNav: [],
      })),
    },
  ]

  return (
    <Layout>
      <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
      <ContentWithSideNavigation items={navigatorItems}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default NetworksPage
